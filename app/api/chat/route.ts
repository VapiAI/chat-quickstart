import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { message, apiKey, assistantId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!apiKey || !assistantId) {
      return NextResponse.json(
        { success: false, error: 'API key and assistant ID are required' },
        { status: 400 }
      );
    }

    // Create OpenAI client with user-provided API key
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.vapi.ai/chat'
    });

    // @ts-expect-error - VAPI supports these parameters
    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: message,
      stream: true,
      assistantId: assistantId
    });

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
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