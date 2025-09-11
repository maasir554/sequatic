import { NextRequest, NextResponse } from 'next/server';
import { aiService, AIContext } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, mode, context } = body as {
      message: string;
      mode: 'ask' | 'agentic';
      context: AIContext;
    };

    if (!message || !mode || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: message, mode, context' },
        { status: 400 }
      );
    }

    const response = await aiService.processMessage(message, mode, context);
    console.log('AI Response:', response)
    return NextResponse.json(response);
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { 
        error: 'AI processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AI Chat API is running',
    modes: ['ask', 'agentic'],
    status: 'healthy'
  });
}
