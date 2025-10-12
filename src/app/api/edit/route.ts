import { openai } from '@ai-sdk/openai';
import { generateText, CoreMessage } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { supermemoryTools } from "@supermemory/tools/ai-sdk"

export async function POST(req: NextRequest) {
  try {
    const { selectedText, prompt, documentContext } = await req.json();

    // Validate required fields
    if (!selectedText || !prompt) {
      return NextResponse.json(
        { error: 'Selected text and prompt are required' },
        { status: 400 }
      );
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
    const userPrompt = `Document context: ${documentContext ? documentContext.slice(0, 500) + '...' : 'No additional context'}

    Selected text to edit: "${selectedText}"

    Instruction: ${prompt}

    Please apply the instruction to the selected text and return only the improved version:`;

    // Generate AI response
    const messages: CoreMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const generateConfig = {
      model: openai('gpt-4o-mini'), // Using the faster, cheaper model for text editing
      messages,
      temperature: 0.7,
      maxTokens: 500,
      ...(process.env.SUPERMEMORY_API_KEY && {
        tools: supermemoryTools(process.env.SUPERMEMORY_API_KEY)
      })
    };

    const { text } = await generateText(generateConfig);

    return NextResponse.json({
      success: true,
      originalText: selectedText,
      suggestedText: text.trim().replace(/^["']|["']$/g, ''),
      prompt: prompt
    });

  } catch (error) {
    console.error('Edit API Error:', error);
    
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process text editing request' },
      { status: 500 }
    );
  }
} 