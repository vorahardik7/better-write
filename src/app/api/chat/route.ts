import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, documentContent } = await req.json();

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return new Response('Last message must be from user', { status: 400 });
    }

    // Create system prompt for document chat
    const systemPrompt = `You are an AI assistant integrated into a document editor called VibeDoc. You help users understand, analyze, and improve their documents through conversation.

    Current document content:
    "${documentContent || 'No document content available'}"

    Your capabilities:
    - Answer questions about the document content
    - Provide summaries and analysis
    - Suggest improvements and edits
    - Help with formatting and structure
    - Generate content based on existing text
    - Provide word counts, reading time estimates
    - Identify key themes and topics
    - Help with grammar and style

    Guidelines:
    - Be helpful, conversational, and friendly
    - Reference specific parts of the document when relevant
    - Provide actionable suggestions
    - If the document is empty or very short, guide the user on how to get started
    - Keep responses concise but informative
    - Focus on the document content and writing improvement`;

    // Prepare messages for the AI
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Generate streaming response
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: aiMessages,
      temperature: 0.7,
      maxOutputTokens: 800,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return new Response('OpenAI API key not configured', { status: 500 });
      }
    }

    return new Response('Failed to process chat request', { status: 500 });
  }
} 