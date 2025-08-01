import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterAPI, parseToolCalls } from '@/lib/openrouter';
import { Message } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      );
    }

    const openRouter = new OpenRouterAPI(apiKey);
    const response = await openRouter.sendMessage(messages);

    // Parse any artifacts from tool calls
    const artifacts = parseToolCalls(response);

    return NextResponse.json({
      message: response.choices[0]?.message?.content || '',
      artifacts,
      usage: response.usage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}