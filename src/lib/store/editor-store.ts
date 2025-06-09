import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Editor } from '@tiptap/react';
import type { TextSelection, AISuggestion, EditorState } from '@/types/editor';

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  content: "<h1>Welcome to VibeDoc!</h1><p>Start writing your document with rich formatting, tables, images, and AI assistance.</p><p>Select any text and press <kbd>⌘K</kbd> to get instant AI suggestions for improvement.</p><blockquote><p>This is the future of document editing - where AI understands your intent and helps you write better.</p></blockquote>",
  selection: null,
  aiSuggestion: null,
  isProcessing: false,
  editorRef: null,

  // Actions
  setContent: (content: string) => {
    
    set({ content });
  },
  
  setSelection: (selection: TextSelection | null) => {
    
    set({ selection });
  },

  setEditorRef: (editor: Editor) => {
    
    set({ editorRef: editor });
  },

  requestAISuggestion: async (prompt: string) => {
    const { selection, editorRef } = get();
    if (!selection || !editorRef) {
      
      return;
    }

    
    
    
    set({ isProcessing: true });

    try {
      // Get plain text context for the API
      const documentContext = editorRef.getText();
      
      // Try real API first
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedText: selection.text,
          prompt: prompt,
          documentContext: documentContext
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

      
      set({ aiSuggestion: suggestion });
      
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },

  acceptSuggestion: () => {
    const { editorRef, aiSuggestion } = get();
    if (!aiSuggestion || !editorRef) return;

    
    
    const { selection, suggestedText } = aiSuggestion;
    
    // Clear current selection first
    editorRef
      .chain()
      .focus()
      .setTextSelection({ from: selection.start, to: selection.end })
      .deleteSelection()
      .run();
    
    // Convert markdown to HTML for TipTap
    const htmlContent = convertMarkdownToHTML(suggestedText);
    
    editorRef
      .chain()
      .focus()
      .insertContent(htmlContent, {
        parseOptions: {
          preserveWhitespace: 'full',
        },
      })
      .run();

    set({ 
      aiSuggestion: null, 
      selection: null 
    });
  },

  rejectSuggestion: () => {
    set({ aiSuggestion: null });
  },
}));


// Convert markdown to HTML for TipTap
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Bold text
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic text
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Unordered lists
  html = html.replace(/^(\s*)- (.+)$/gm, (match, indent, text) => {
    const level = indent.length / 2;
    return `${'  '.repeat(level)}<li>${text}</li>`;
  });

  // Wrap consecutive list items in <ul> tags
  html = html.replace(/((?:\s*<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^(\s*)\d+\. (.+)$/gm, (match, indent, text) => {
    const level = indent.length / 2;
    return `${'  '.repeat(level)}<li>${text}</li>`;
  });

  // Wrap consecutive ordered list items in <ol> tags
  html = html.replace(/((?:\s*<li>.*<\/li>\s*)+)/g, (match) => {
    // Check if this was from numbered lists (this is a simplified approach)
    return match.includes('1.') ? `<ol>${match}</ol>` : `<ul>${match}</ul>`;
  });

  // Paragraphs (convert double line breaks to paragraphs)
  html = html.replace(/\n\n+/g, '</p><p>');
  
  // Wrap content in paragraph tags if it doesn't start with a block element
  if (!html.match(/^<(h[1-6]|ul|ol|pre|blockquote)/)) {
    html = `<p>${html}</p>`;
  }

  // Clean up extra paragraph tags around block elements
  html = html.replace(/<p>(<(h[1-6]|ul|ol|pre|blockquote)[^>]*>.*?<\/\2>)<\/p>/g, '$1');

  return html;
}

