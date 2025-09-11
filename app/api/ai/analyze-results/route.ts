import { NextRequest, NextResponse } from 'next/server';
import { aiService, AIContext } from '@/lib/ai-service';
import { QueryResult } from '@/lib/sqlite';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      originalQuestion, 
      executedQuery, 
      queryResults, 
      context,
      conversationId 
    } = body as {
      originalQuestion: string;
      executedQuery: string;
      queryResults: QueryResult;
      context: AIContext;
      conversationId: string;
    };

    if (!originalQuestion || !executedQuery || !queryResults || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: originalQuestion, executedQuery, queryResults, context' },
        { status: 400 }
      );
    }

    // Add conversation tracking to context
    const enhancedContext = {
      ...context,
      conversationId,
      step: 'analyzing_results' as const
    };

    const response = await aiService.analyzeQueryResults(
      originalQuestion,
      executedQuery,
      queryResults,
      enhancedContext
    );
    
    console.log('Analysis Response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Analysis API Error:', error);
    return NextResponse.json(
      { 
        error: 'Result analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AI Results Analysis API is running',
    purpose: 'Analyze query results and provide natural language insights',
    status: 'healthy'
  });
}
