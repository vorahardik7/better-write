import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { TextSelection, AISuggestion, EditorState } from '@/types/editor';

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  content: "Welcome to VibeDoc! Start typing or select text and press Cmd+K to get AI suggestions.\n\nTry selecting this text and asking AI to make it more formal, or to summarize it.\n\nThis is the future of document editing - where AI understands your intent and helps you write better.",
  selection: null,
  aiSuggestion: null,
  isProcessing: false,

  // Actions
  setContent: (content: string) => {
    console.log('📝 Content updated');
    set({ content });
  },
  
  setSelection: (selection: TextSelection | null) => {
    console.log('🎯 Selection changed:', selection?.text || 'none');
    set({ selection });
  },

  requestAISuggestion: async (prompt: string) => {
    const { selection, content } = get();
    if (!selection) {
      console.log('❌ No text selected');
      return;
    }

    console.log('🤖 Requesting AI suggestion for:', selection.text);
    console.log('📝 Prompt:', prompt);
    
    set({ isProcessing: true });

    try {
      // Try real API first
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedText: selection.text,
          prompt: prompt,
          documentContext: content
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      const suggestion: AISuggestion = {
        id: nanoid(),
        originalText: selection.text,
        suggestedText: data.suggestedText,
        selection,
        reasoning: `Applied: "${prompt}"`
      };

      console.log('✅ AI suggestion received:', data.suggestedText);
      set({ aiSuggestion: suggestion });
      
    } catch (error) {
      console.warn('⚠️ API failed, using mock response:', error);
      
      // Fallback to mock response
      try {
        const suggestedText = await mockAIResponse(selection.text, prompt);
        
        const suggestion: AISuggestion = {
          id: nanoid(),
          originalText: selection.text,
          suggestedText,
          selection,
          reasoning: `Applied: "${prompt}" (Mock)`
        };

        console.log('✅ Mock AI suggestion received:', suggestedText);
        set({ aiSuggestion: suggestion });
        
      } catch (mockError) {
        console.error('❌ Both API and mock failed:', mockError);
      }
    } finally {
      set({ isProcessing: false });
    }
  },

  acceptSuggestion: () => {
    const { content, aiSuggestion } = get();
    if (!aiSuggestion) return;

    console.log('✅ Accepting suggestion');
    
    const { selection, suggestedText } = aiSuggestion;
    const newContent = 
      content.slice(0, selection.start) + 
      suggestedText + 
      content.slice(selection.end);

    set({ 
      content: newContent, 
      aiSuggestion: null, 
      selection: null 
    });
  },

  rejectSuggestion: () => {
    console.log('❌ Rejecting suggestion');
    set({ aiSuggestion: null });
  },
}));

// Mock AI function - simulates OpenAI/Claude responses
async function mockAIResponse(selectedText: string, prompt: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('🤖 Mock AI processing:', { selectedText, prompt });
  
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('formal')) {
    return selectedText
      .replace(/\b(cool|awesome|great|nice)\b/gi, 'excellent')
      .replace(/\b(hey|hi|yo)\b/gi, 'Hello')
      .replace(/!/g, '.')
      .replace(/\b(gonna|wanna|gotta)\b/gi, (match) => {
        const replacements = { gonna: 'going to', wanna: 'want to', gotta: 'have to' };
        return replacements[match.toLowerCase() as keyof typeof replacements];
      });
  }
  
  if (lowerPrompt.includes('casual')) {
    return selectedText
      .replace(/\b(Hello|Greetings|Good day)\b/gi, 'Hey')
      .replace(/excellent/gi, 'awesome')
      .replace(/\b(going to)\b/gi, 'gonna')
      .replace(/\./g, '!');
  }
  
  if (lowerPrompt.includes('shorter') || lowerPrompt.includes('concise')) {
    const words = selectedText.split(' ');
    return words.slice(0, Math.ceil(words.length / 2)).join(' ') + '...';
  }
  
  if (lowerPrompt.includes('longer') || lowerPrompt.includes('expand')) {
    return `${selectedText} This expanded version provides additional context and elaboration to give readers a more comprehensive understanding of the subject matter.`;
  }
  
  if (lowerPrompt.includes('summary') || lowerPrompt.includes('summarize')) {
    const words = selectedText.split(' ');
    return `Summary: ${words.slice(0, Math.min(15, words.length)).join(' ')}${words.length > 15 ? '...' : ''}`;
  }
  
  if (lowerPrompt.includes('question')) {
    return `${selectedText} What are your thoughts on this?`;
  }
  
  // Default enhancement
  return `${selectedText.trim()} [Enhanced with AI based on: "${prompt}"]`;
} 