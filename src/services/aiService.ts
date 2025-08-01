import type { Message, Artifact } from '../types';
import { artifactManager } from './ArtifactManager';
import { toolService } from './toolService';

// IMPORTANT: Uses OpenRouter "Horizon Alpha" model (rumoured GPT-5 mini) for chat completions.
// Requires env var VITE_OPENROUTER_API_KEY with your OpenRouter API key (pk-...).
// Streaming SSE responses are parsed and yielded as incremental chunks compatible with the rest
// of the application (App.tsx expects the same generator signature).

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('OpenRouter API key not found. Please add VITE_OPENROUTER_API_KEY to your .env file');
}

// OpenRouter endpoint
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Streams chat completion from OpenRouter Horizon-Alpha model.
 * Maintains the existing generator interface expected by the UI.
 */
export async function* streamChatCompletion(
  messages: Message[],
  // The UI still passes an old enum value but we ignore it – Horizon-Alpha is always used.
  _model: any = 'horizon-alpha',
  customSystemPrompt: string = ''
): AsyncGenerator<{ content: string; artifacts?: Artifact[]; toolResults?: any[]; isThinking?: boolean }, void, unknown> {
  // ---------------------------------------------------------------------------
  // Build messages array for OpenAI-compatible schema
  // ---------------------------------------------------------------------------
  const baseSystemPrompt = `You are CloakedChat, an advanced AI assistant powered by the experimental Cloaked Horizon-Alpha model (rumoured GPT-5-mini).\n\n` +
    `FEATURES:\n` +
    `• Rich Markdown & code-block formatting with syntax highlighting.\n` +
    `• Capability to create **Artifacts** – interactive content blocks exactly following the format below.\n` +
    `• Access to function calling for the following tools: web_search, web_scrape, generate_image.\n` +
    `\n` +
    `ARTIFACT FORMAT (STRICT):\n` +
    `[ARTIFACT:id:type:title]\n` +
    `content here\n` +
    `[/ARTIFACT]\n` +
    `type must be one of \'text/html\', \'application/vnd.kana.react\', \'application/vnd.kana.code\', \'text/markdown\', \'image/svg+xml\'.\n` +
    `\n` +
    `When you create an artifact do NOT show its raw content in the normal text reply; just include a concise description and rely on the renderer.\n` +
    `${customSystemPrompt}`;

  const openRouterMessages = [
    { role: 'system', content: baseSystemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  // ---------------------------------------------------------------------------
  // Prepare tools schema for function calling (OpenAI style)
  // ---------------------------------------------------------------------------
  const tools = toolService.getAvailableTools().map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));

  // ---------------------------------------------------------------------------
  // Make streaming request
  // ---------------------------------------------------------------------------
  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      // Helpful for rate-limits & analytics on OpenRouter
      'X-Title': 'CloakedChat',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://cloakedchat.app'
    },
    body: JSON.stringify({
      model: 'openrouter/horizon-alpha',
      stream: true,
      temperature: 0.7,
      max_tokens: 8192,
      messages: openRouterMessages,
      tools
    })
  });

  if (!response.ok || !response.body) {
    const errText = await response.text().catch(() => response.statusText);
    yield { content: `Error: Unable to connect to Horizon-Alpha model – ${errText}` };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  let fullContent = '';
  let artifacts: Artifact[] = [];
  let toolResults: any[] = [];

  // Helper to process artifacts once stream ends
  const flushArtifacts = async () => {
    const processed = await processArtifacts(fullContent);
    fullContent = processed.content;
    artifacts = processed.artifacts;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Split by new line "\n\n" (SSE events are separated by blank line)
    const events = buffer.split('\n\n');
    // Keep last partial
    buffer = events.pop() || '';

    for (const evt of events) {
      const lines = evt.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.replace(/^data:\s*/, '').trim();
        if (data === '[DONE]') {
          await flushArtifacts();
          yield { content: fullContent, artifacts, toolResults };
          return;
        }

        try {
          const json = JSON.parse(data);
          const choice = json.choices?.[0];
          if (!choice) continue;

          // Handle text deltas
          const deltaContent = choice.delta?.content;
          if (deltaContent) {
            fullContent += deltaContent;
            yield { content: fullContent, artifacts, toolResults };
          }

          // Handle future tool calls (not fully implemented – placeholder)
          if (choice.delta?.tool_calls) {
            // TODO: implement tool call streaming when OpenRouter supports it
          }
        } catch (err) {
          console.error('SSE parse error', err);
        }
      }
    }
  }

  // Fallback flush if stream closed without [DONE]
  await flushArtifacts();
  yield { content: fullContent, artifacts, toolResults };
}

// ---------------------------------------------------------------------------
// Artifact post-processing (same logic as previous version)
// ---------------------------------------------------------------------------
async function processArtifacts(content: string): Promise<{ content: string; artifacts: Artifact[] }> {
  const artifactRegex = /\[ARTIFACT:([^:]+):([^:]+):([^\]]+)\]([\s\S]*?)\[\/ARTIFACT\]/g;
  const artifacts: Artifact[] = [];
  let processedContent = content;

  let match;
  while ((match = artifactRegex.exec(content)) !== null) {
    const [fullMatch, id, type, title, artifactContent] = match;
    try {
      const result = await artifactManager.createArtifact(
        id,
        type as any,
        artifactContent.trim(),
        { title: title.trim() }
      );

      if (result.success && result.artifact) {
        artifacts.push(result.artifact);
        processedContent = processedContent.replace(
          fullMatch,
          `\n**${title}** (Interactive Artifact)\n\n*Displayed below.*\n`
        );
      }
    } catch (err) {
      console.error('Artifact creation failed', err);
    }
  }

  return { content: processedContent, artifacts };
}