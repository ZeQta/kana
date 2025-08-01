import { OpenRouterResponse, Message, CreateArtifactArgs } from '@/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'openrouter/horizon-alpha';

const SYSTEM_PROMPT = `You are CloakedChat, a powerful AI assistant powered by the Horizon Alpha model. You have access to advanced capabilities including:

1. **Artifacts Creation**: You can create interactive content using the create_artifact function. Use this for:
   - HTML/CSS/JavaScript applications and demos
   - React components and applications
   - Python scripts and programs
   - Markdown documents and documentation
   - JSON data structures
   - Any code that would benefit from being displayed in an interactive format

2. **Response Formatting**: Format your responses using:
   - Markdown for rich text formatting
   - Code blocks with syntax highlighting
   - Tables, lists, and structured content
   - Links and embedded content where appropriate

3. **File Analysis**: When users upload files, analyze them thoroughly and provide detailed insights.

**When to use artifacts:**
- Creating interactive demos or applications
- Writing substantial code (>10 lines)
- Creating visual content like HTML pages
- Building React components
- Writing documentation that benefits from rendering
- Any content that would be more useful as a separate, interactive item

**Artifact naming:** Use descriptive, user-friendly names like "Todo App", "Data Visualization", "API Documentation", etc.

Always be helpful, accurate, and provide detailed explanations for your responses. When creating artifacts, explain what you're building and how it works.`;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_artifact',
      description: 'Create an interactive artifact (HTML, React, Python, etc.) that will be displayed in a separate panel',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'A descriptive name for the artifact (e.g., "Todo App", "Data Visualization")'
          },
          type: {
            type: 'string',
            enum: ['html', 'react', 'python', 'javascript', 'markdown', 'css', 'json'],
            description: 'The type of artifact to create'
          },
          content: {
            type: 'string',
            description: 'The complete content/code for the artifact'
          },
          description: {
            type: 'string',
            description: 'Optional description of what the artifact does'
          }
        },
        required: ['name', 'type', 'content']
      }
    }
  }
];

export class OpenRouterAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(messages: Message[]): Promise<OpenRouterResponse> {
    if (!this.apiKey || this.apiKey === 'your_openrouter_api_key_here') {
      throw new Error('OpenRouter API key is not configured. Please add your API key to the .env.local file.');
    }

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        'X-Title': 'CloakedChat'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: formattedMessages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 4000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async streamMessage(messages: Message[], onChunk: (chunk: string) => void): Promise<void> {
    if (!this.apiKey || this.apiKey === 'your_openrouter_api_key_here') {
      throw new Error('OpenRouter API key is not configured. Please add your API key to the .env.local file.');
    }

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        'X-Title': 'CloakedChat'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: formattedMessages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 4000,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to get response reader');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch {
              // Ignore parsing errors for individual chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export function parseToolCalls(response: OpenRouterResponse): CreateArtifactArgs[] {
  const toolCalls = response.choices?.[0]?.message?.tool_calls || [];
  const artifacts: CreateArtifactArgs[] = [];

  for (const toolCall of toolCalls) {
    if (toolCall.function.name === 'create_artifact') {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        artifacts.push(args);
      } catch (error) {
        console.error('Error parsing tool call arguments:', error);
      }
    }
  }

  return artifacts;
}