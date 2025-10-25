import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getAIContext } from '../../../lib/supermemory/search';
import { 
  sanitizeString, 
  validateDocumentId, 
  logSecurityEvent, 
  checkRateLimit 
} from '../../../lib/security';

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    // CRITICAL: Add authentication check
    if (!session?.user) {
      logSecurityEvent('unauthorized_edit_attempt', { endpoint: '/api/edit' }, undefined, req);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(session.user.id, 20, 60000); // 20 requests per minute
    if (!rateLimit.allowed) {
      logSecurityEvent('rate_limit_exceeded', { 
        userId: session.user.id, 
        endpoint: '/api/edit' 
      }, session.user.id, req);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { selectedText, prompt, documentContext, documentId } = await req.json();

    // Comprehensive input validation with sanitization
    const validationErrors: string[] = [];
    
    if (!selectedText || typeof selectedText !== 'string') {
      validationErrors.push('Selected text is required and must be a string');
    } else if (selectedText.length > 10000) {
      validationErrors.push('Selected text is too long (max 10,000 characters)');
    }
    
    if (!prompt || typeof prompt !== 'string') {
      validationErrors.push('Prompt is required and must be a string');
    } else if (prompt.length > 1000) {
      validationErrors.push('Prompt is too long (max 1,000 characters)');
    }
    
    if (documentContext && typeof documentContext === 'string' && documentContext.length > 50000) {
      validationErrors.push('Document context is too long (max 50,000 characters)');
    }
    
    if (documentId && !validateDocumentId(documentId)) {
      validationErrors.push('Document ID must be a valid UUID');
    }
    
    if (validationErrors.length > 0) {
      logSecurityEvent('validation_failed', { 
        errors: validationErrors, 
        endpoint: '/api/edit' 
      }, session.user.id, req);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedSelectedText = sanitizeString(selectedText);
    const sanitizedPrompt = sanitizeString(prompt);
    const sanitizedDocumentContext = documentContext ? sanitizeString(documentContext) : '';

    // Get relevant context from Supermemory (if user is authenticated)
    let supermemoryContext: Array<{ content: string; source: string; relevance: number }> = [];
    
    if (session?.user && documentId) {
      try {
        const contexts = await getAIContext(sanitizedSelectedText, documentId, session.user.id, 3);
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
    let userPrompt = `Document context: ${sanitizedDocumentContext ? sanitizedDocumentContext.slice(0, 500) + '...' : 'No additional context'}

    Selected text to edit: "${sanitizedSelectedText}"

    Instruction: ${sanitizedPrompt}`;

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
      originalText: sanitizedSelectedText,
      suggestedText: text.trim().replace(/^["']|["']$/g, ''),
      prompt: sanitizedPrompt
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