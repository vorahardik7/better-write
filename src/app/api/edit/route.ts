import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

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
    const systemPrompt = `You are an AI writing assistant integrated into a document editor called VibeDoc. Your role is to help users improve their writing by following their specific instructions.

    Guidelines:
    - Apply the user's instruction exactly as requested
    - Keep the same general length unless specifically asked to change it
    - Maintain the original meaning and intent
    - Only return the improved text, no explanations or additional formatting
    - If the instruction is unclear, make your best interpretation
    - For formatting requests (formal/casual), adjust tone appropriately
    - For grammar fixes, correct errors while preserving style
    - For summarization, create a concise version of the main points`;

    // Create the user prompt with context
    const userPrompt = `Document context: ${documentContext ? documentContext.slice(0, 500) + '...' : 'No additional context'}

    Selected text to edit: "${selectedText}"

    Instruction: ${prompt}

    Please apply the instruction to the selected text and return only the improved version:`;

    // Generate AI response
    const { text } = await generateText({
      model: openai('gpt-4o-mini'), // Using the faster, cheaper model for text editing
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    return NextResponse.json({
      success: true,
      originalText: selectedText,
      suggestedText: text.trim().replace(/^"|\s+"/g, ''),
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