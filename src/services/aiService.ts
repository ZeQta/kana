import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message, StreamResponse, Artifact } from '../types';
import { artifactManager } from './ArtifactManager';
import { toolService } from './toolService';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  console.error('Google API key not found. Please add VITE_GOOGLE_API_KEY to your .env file');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export async function* streamChatCompletion(
  messages: Message[], 
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro' = 'gemini-2.5-flash',
  customSystemPrompt: string = ''
): AsyncGenerator<{ content: string; artifacts?: Artifact[]; toolResults?: any[]; isThinking?: boolean }, void, unknown> {
  try {
    const geminiModel = genAI.getGenerativeModel({ 
      model: model,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
      tools: [{
        functionDeclarations: toolService.getAvailableTools().map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }))
      }]
    });

    const baseSystemPrompt = `You are Kana, India's first intelligent AI chatbot assistant. You are helpful, knowledgeable, and provide accurate information with a friendly personality.

CRITICAL TOOL CALLING INSTRUCTIONS:
When you need to use tools, you MUST call them using the exact function calling format. Here's how tool calling works:

1. TOOL AVAILABILITY:
   - web_search: Search the web for current information, news, recent events
   - web_scrape: Extract content from specific website URLs  
   - generate_image: Create high-quality images from text descriptions

2. TOOL CALLING FORMAT:
   You call tools by using the function calling mechanism. The system will automatically handle the tool execution.
   
   For web_search: Call with parameter "query" (string)
   For web_scrape: Call with parameter "url" (string) 
   For generate_image: Call with parameters "prompt" (string), optional "size", "style", "quality"

3. TOOL USAGE GUIDELINES:
   - Use web_search when users ask for current information, news, or recent events
   - Use web_scrape when users want to read content from specific websites
   - Use generate_image when users ask you to create, generate, make, or draw images
   - Always explain what tools you're using and why
   - Continue your response naturally after tool execution
   - Provide comprehensive analysis of tool results

4. MODEL-SPECIFIC LIMITS:
   ${model === 'gemini-2.5-pro' ? 'AGENTIC MODE: You can use unlimited tools in a single response to provide comprehensive answers. Use as many tools as needed.' : 'STANDARD MODE: Limit tool usage to 3 tools maximum per response for efficiency.'}

5. TOOL RESULT HANDLING:
   - Always acknowledge when tools are being executed
   - Provide context about what information you're gathering
   - Synthesize tool results into your response
   - If tools fail, explain the limitation and provide alternative approaches

ARTIFACT CREATION GUIDELINES:
Create artifacts for substantial content like code, HTML, React components, visualizations, or interactive content.

ARTIFACT TYPES AND USAGE:
- text/html: For HTML pages, web apps, or interactive content
- application/vnd.kana.react: For React components and interactive UIs
- application/vnd.kana.code: For code snippets with syntax highlighting
- image/svg+xml: For SVG graphics and diagrams
- text/markdown: For formatted documents

ARTIFACT FORMAT:
When creating artifacts, use this exact format:
[ARTIFACT:id:type:title]
content here
[/ARTIFACT]

Example:
[ARTIFACT:calculator:application/vnd.kana.react:Simple Calculator]
import React, { useState } from 'react';

export default function Calculator() {
  const [result, setResult] = useState('0');
  // ... component code
}
[/ARTIFACT]

RESPONSE GUIDELINES:
- Be helpful, accurate, and engaging
- Use tools proactively when they would enhance your response
- Create artifacts for substantial, reusable content
- Provide clear explanations of your actions
- Continue responding after tool execution completes

${customSystemPrompt ? `\nCUSTOM INSTRUCTIONS:\n${customSystemPrompt}` : ''}

Remember: You have access to real-time web search, web scraping, and image generation. Use these tools to provide the most current and comprehensive responses possible.`;

    // Convert messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add system prompt as first message
    const chatHistory = [
      {
        role: 'user',
        parts: [{ text: baseSystemPrompt }]
      },
      {
        role: 'model', 
        parts: [{ text: 'I understand. I am Kana, India\'s first intelligent AI chatbot assistant. I have access to web search, web scraping, and image generation tools, and I can create interactive artifacts. I\'m ready to help you with comprehensive, up-to-date information and create engaging content. How can I assist you today?' }]
      },
      ...geminiMessages
    ];

    const chat = geminiModel.startChat({
      history: chatHistory.slice(0, -1)
    });

    const lastMessage = geminiMessages[geminiMessages.length - 1];
    
    // Show thinking animation for Agentic mode
    if (model === 'gemini-2.5-pro') {
      yield { content: '', isThinking: true };
    }

    const result = await chat.sendMessageStream(lastMessage.parts[0].text);

    let fullContent = '';
    let artifacts: Artifact[] = [];
    let toolResults: any[] = [];
    let toolCallCount = 0;
    const maxToolCalls = model === 'gemini-2.5-pro' ? Infinity : 3;
    let hasStartedContent = false;

    try {
      for await (const chunk of result.stream) {
        // Handle text content
        const chunkText = chunk.text();
        if (chunkText) {
          fullContent += chunkText;
          hasStartedContent = true;
          yield { content: fullContent, artifacts, toolResults };
        }

        // Handle function calls safely
        const functionCalls = chunk.functionCalls();
        if (functionCalls && Array.isArray(functionCalls) && toolCallCount < maxToolCalls) {
          for (const functionCall of functionCalls) {
            if (toolCallCount >= maxToolCalls) break;
            
            try {
              // Show tool execution status
              if (!hasStartedContent) {
                fullContent += `🔧 Using ${functionCall.name}...\n\n`;
                yield { content: fullContent, artifacts, toolResults };
              }

              const toolResult = await toolService.executeTool(
                functionCall.name,
                functionCall.args
              );
              
              toolResults.push({
                name: functionCall.name,
                args: functionCall.args,
                result: toolResult
              });
              
              toolCallCount++;
              yield { content: fullContent, artifacts, toolResults };
            } catch (toolError) {
              console.error('Tool execution error:', toolError);
              toolResults.push({
                name: functionCall.name,
                args: functionCall.args,
                result: {
                  success: false,
                  error: toolError instanceof Error ? toolError.message : 'Tool execution failed'
                }
              });
              yield { content: fullContent, artifacts, toolResults };
            }
          }
        }
      }
    } catch (streamError) {
      console.error('Stream processing error:', streamError);
      if (!hasStartedContent) {
        fullContent = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
      }
    }

    // Process any artifacts in the final content
    const processedResult = await processArtifacts(fullContent);
    if (processedResult.artifacts.length > 0) {
      artifacts = processedResult.artifacts;
    }
    
    yield { content: processedResult.content, artifacts, toolResults };

  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      yield { content: "I need a valid Google API key to function. Please add your VITE_GOOGLE_API_KEY to the .env file." };
    } else {
      yield { content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." };
    }
  }
}

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
        
        // Replace artifact markup with a placeholder
        processedContent = processedContent.replace(
          fullMatch,
          `\n**${title}** (Interactive Content)\n\n*This content is displayed as an interactive artifact below.*\n`
        );
      }
    } catch (error) {
      console.error('Error creating artifact:', error);
    }
  }

  return { content: processedContent, artifacts };
}