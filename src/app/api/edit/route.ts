import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getAIContext } from '../../../lib/supermemory/search';

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { selectedText, prompt, documentContext, documentId } = body;

    // Get relevant context from Supermemory (if user is authenticated)
    let supermemoryContext: Array<{ content: string; source: string; relevance: number }> = [];
    
    if (session?.user && documentId) {
      try {
        const contexts = await getAIContext(selectedText, documentId, session.user.id, 3);
        supermemoryContext = contexts.map(ctx => ({
          content: ctx.content,
          source: ctx.source || 'Related document',
          relevance: ctx.relevance
        }));
      } catch (error) {
        console.error('Failed to get Supermemory context:', error);
        // Continue without context
      }
    }

    // Create the system prompt for text editing
    const systemPrompt = `You are an AI writing assistant integrated into a document editor called BetterWrite. Your role is to help users improve their writing by following their specific instructions.

    Guidelines:
    - Apply the user's instruction exactly as requested
    - Keep the same general length unless specifically asked to change it
    - Maintain the original meaning and intent
    - Only return the improved text, no explanations or additional formatting
    - If the instruction is unclear, make your best interpretation
    - For formatting requests (formal/casual), adjust tone appropriately
    - For grammar fixes, correct errors while preserving style
    - For summarization, create a concise version of the main points
    - For table requests, create HTML tables with proper structure
    - For lists, use clean markdown-style formatting with proper indentation (- for bullets, 1. 2. 3. for numbered, proper spacing for nested items)
    - For code examples, use markdown code blocks with language specification when possible
    - Always return content that preserves natural formatting and spacing`;

    // Create the user prompt with context
    let userPrompt = `Document context: ${documentContext ? documentContext.slice(0, 500) + '...' : 'No additional context'}

    Selected text to edit: "${selectedText}"

    Instruction: ${prompt}`;

    // Add Supermemory context if available
    if (supermemoryContext.length > 0) {
      userPrompt += `\n\nRelevant context from your other documents:\n`;
      supermemoryContext.forEach((ctx, idx) => {
        userPrompt += `\n${idx + 1}. From "${ctx.source}" (relevance: ${(ctx.relevance * 100).toFixed(0)}%):\n${ctx.content.substring(0, 200)}...\n`;
      });
      userPrompt += `\nConsider this context when applying the instruction, but focus on improving the selected text.`;
    }

    userPrompt += `\n\nPlease apply the instruction to the selected text and return only the improved version:`;

    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: userPrompt,
      },
    ];

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: messages,
      temperature: 0.7,
      maxOutputTokens: 500,
    });

    return NextResponse.json({
      success: true,
      originalText: selectedText,
      suggestedText: text.trim().replace(/^["']|["']$/g, ''),
      prompt: prompt
    });

  } catch (error) {
    console.error('Edit API Error:', error);
    
    // Handle specific API errors without exposing internal details
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service is not configured' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // Generic error response to prevent information leakage
    return NextResponse.json(
      { error: 'Failed to process text editing request' },
      { status: 500 }
    );
  }
} 