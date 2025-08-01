import axios from 'axios';
import type { Message, Artifact, ToolCall, ToolResult, ChatConfig } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

// Default system prompt for CloakedChat
const DEFAULT_SYSTEM_PROMPT = `You are CloakedChat, a powerful AI assistant powered by Horizon Alpha. You have access to advanced capabilities including:

1. **Artifact Creation**: You can create interactive artifacts using the create_artifacts function. These can be:
   - HTML applications and games
   - React components
   - Python scripts
   - Markdown documents
   - Charts and visualizations
   - Code examples in various languages

2. **Multimodal Analysis**: You can analyze images, PDFs, and other file types uploaded by users.

3. **Advanced Formatting**: You can provide responses with:
   - Rich markdown formatting
   - Code syntax highlighting
   - Tables and columns
   - Embedded links and references
   - Mathematical expressions

4. **Interactive Features**: You can create:
   - Interactive games and applications
   - Data visualizations
   - Educational content
   - Prototypes and demos

When creating artifacts, use descriptive names and provide comprehensive content. Always explain what the artifact does and how to use it.

Be helpful, creative, and engaging in your responses. Provide detailed explanations and examples when appropriate.`;

interface StreamChunk {
  content: string;
  artifacts?: Artifact[];
  toolResults?: ToolResult[];
  isThinking?: boolean;
  finishReason?: string;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: any;
    };
  }>;
  tool_choice?: 'auto' | 'none' | {
    type: 'function';
    function: {
      name: string;
    };
  };
}

// Function definitions for artifacts
const ARTIFACT_FUNCTIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'create_artifacts',
      description: 'Create interactive artifacts like games, applications, visualizations, or code examples',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Descriptive name for the artifact (e.g., "Flappy Bird Game", "Data Visualization Dashboard")'
          },
          type: {
            type: 'string',
            enum: [
              'html', 'react', 'python', 'javascript', 'typescript', 
              'markdown', 'json', 'csv', 'sql', 'svg', 'chart', 'game'
            ],
            description: 'Type of artifact to create'
          },
          content: {
            type: 'string',
            description: 'The complete content/code for the artifact'
          },
          description: {
            type: 'string',
            description: 'Brief description of what the artifact does'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags to categorize the artifact'
          }
        },
        required: ['name', 'type', 'content']
      }
    }
  }
];

export async function* streamChatCompletion(
  messages: Message[],
  model: string = 'openrouter/horizon-alpha',
  customSystemPrompt?: string,
  config?: Partial<ChatConfig>
): AsyncGenerator<StreamChunk> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
  }

  const systemPrompt = customSystemPrompt || DEFAULT_SYSTEM_PROMPT;
  
  // Convert messages to OpenRouter format
  const openRouterMessages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const message of messages) {
    if (message.role === 'user') {
      const content: OpenRouterMessage['content'] = message.content;
      
      // Handle file uploads for multimodal support
      if (message.files && message.files.length > 0) {
        const contentArray: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
          { type: 'text', text: message.content }
        ];
        
        for (const file of message.files) {
          if (file.type.startsWith('image/')) {
            contentArray.push({
              type: 'image_url',
              image_url: { url: file.url || `data:${file.type};base64,${file.content}` }
            });
          }
        }
        
        openRouterMessages.push({ role: 'user', content: contentArray });
      } else {
        openRouterMessages.push({ role: 'user', content });
      }
    } else if (message.role === 'assistant') {
      const assistantMessage: OpenRouterMessage = { role: 'assistant', content: message.content };
      
      if (message.toolResults && message.toolResults.length > 0) {
        assistantMessage.tool_calls = message.toolResults.map(result => ({
          id: result.tool_call_id,
          type: 'function',
          function: {
            name: 'create_artifacts',
            arguments: result.content
          }
        }));
      }
      
      openRouterMessages.push(assistantMessage);
    } else if (message.role === 'tool') {
      openRouterMessages.push({
        role: 'tool',
        content: message.content,
        tool_call_id: message.toolResults?.[0]?.tool_call_id
      });
    }
  }

  const requestBody: OpenRouterRequest = {
    model,
    messages: openRouterMessages,
    stream: true,
    temperature: config?.temperature ?? 0.7,
    max_tokens: config?.maxTokens ?? 4000,
    top_p: config?.topP ?? 1,
    frequency_penalty: config?.frequencyPenalty ?? 0,
    presence_penalty: config?.presencePenalty ?? 0,
    tools: ARTIFACT_FUNCTIONS,
    tool_choice: 'auto'
  };

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CloakedChat'
        },
        responseType: 'stream'
      }
    );

    let currentContent = '';
    let currentArtifacts: Artifact[] = [];
    let currentToolResults: ToolResult[] = [];
    let isThinking = false;

    for await (const chunk of response.data) {
      const lines = chunk.toString().split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.choices && parsed.choices[0]) {
              const choice = parsed.choices[0];
              
              // Handle thinking state
              if (choice.delta?.content === null && choice.finish_reason === null) {
                isThinking = true;
                yield { content: currentContent, isThinking: true };
                continue;
              }
              
              // Handle content
              if (choice.delta?.content) {
                currentContent += choice.delta.content;
                isThinking = false;
                yield { 
                  content: currentContent, 
                  artifacts: currentArtifacts,
                  toolResults: currentToolResults,
                  isThinking: false 
                };
              }
              
              // Handle tool calls
              if (choice.delta?.tool_calls) {
                for (const toolCall of choice.delta.tool_calls) {
                  if (toolCall.function?.arguments) {
                    try {
                      const args = JSON.parse(toolCall.function.arguments);
                      
                      const artifact: Artifact = {
                        id: `artifact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: args.name,
                        type: mapArtifactType(args.type),
                        content: args.content,
                        metadata: {
                          title: args.name,
                          description: args.description || '',
                          language: args.type,
                          tags: args.tags || [],
                          created: Date.now(),
                          lastModified: Date.now(),
                          version: 1
                        },
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                      };
                      
                      currentArtifacts.push(artifact);
                      
                      const toolResult: ToolResult = {
                        tool_call_id: toolCall.id,
                        role: 'tool',
                        content: JSON.stringify(args)
                      };
                      
                      currentToolResults.push(toolResult);
                      
                      yield { 
                        content: currentContent, 
                        artifacts: currentArtifacts,
                        toolResults: currentToolResults,
                        isThinking: false 
                      };
                    } catch (error) {
                      console.error('Error parsing tool call arguments:', error);
                    }
                  }
                }
              }
              
              // Handle finish
              if (choice.finish_reason) {
                yield { 
                  content: currentContent, 
                  artifacts: currentArtifacts,
                  toolResults: currentToolResults,
                  finishReason: choice.finish_reason,
                  isThinking: false 
                };
              }
            }
          } catch (error) {
            console.error('Error parsing stream chunk:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in streamChatCompletion:', error);
    throw error;
  }
}

function mapArtifactType(type: string): string {
  const typeMap: Record<string, string> = {
    'html': 'text/html',
    'react': 'application/vnd.cloaked.react',
    'python': 'application/vnd.cloaked.python',
    'javascript': 'application/vnd.cloaked.javascript',
    'typescript': 'application/vnd.cloaked.typescript',
    'markdown': 'text/markdown',
    'json': 'application/vnd.cloaked.json',
    'csv': 'application/vnd.cloaked.csv',
    'sql': 'application/vnd.cloaked.sql',
    'svg': 'image/svg+xml',
    'chart': 'application/vnd.cloaked.chart',
    'game': 'application/vnd.cloaked.game'
  };
  
  return typeMap[type] || 'text/plain';
}

export async function analyzeFile(file: File): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', 'openrouter/horizon-alpha');

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/files/analyze`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CloakedChat'
        }
      }
    );

    return response.data.analysis;
  } catch (error) {
    console.error('Error analyzing file:', error);
    throw error;
  }
}

export const AVAILABLE_MODELS: Array<{
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
  supportsMultimodal: boolean;
  supportsFunctionCalling: boolean;
}> = [
  {
    id: 'openrouter/horizon-alpha',
    name: 'Horizon Alpha',
    provider: 'Cloaked AI',
    description: 'Most powerful Cloaked model, rumored to be GPT-5 mini in development',
    maxTokens: 128000,
    supportsMultimodal: true,
    supportsFunctionCalling: true
  },
  {
    id: 'openrouter/horizon-beta',
    name: 'Horizon Beta',
    provider: 'Cloaked AI',
    description: 'Fast and efficient Cloaked model',
    maxTokens: 128000,
    supportsMultimodal: true,
    supportsFunctionCalling: true
  },
  {
    id: 'openrouter/horizon-gamma',
    name: 'Horizon Gamma',
    provider: 'Cloaked AI',
    description: 'Balanced performance and speed',
    maxTokens: 128000,
    supportsMultimodal: true,
    supportsFunctionCalling: true
  }
];