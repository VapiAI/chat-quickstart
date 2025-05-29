import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VAPI_API_KEY!,
  baseURL: 'https://api.vapi.ai/chat'
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: message,
      stream: true,
      assistantId: '2abd3196-bfec-4f25-9131-8ec04328be95'
    } as any);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // @ts-ignore - Handle streaming response
          for await (const event of response) {
            if (event.type === 'response.output_text.delta') {
              const chunk = `data: ${JSON.stringify({ delta: event.delta })}\n\n`;
              controller.enqueue(new TextEncoder().encode(chunk));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 