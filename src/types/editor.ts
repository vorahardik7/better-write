import type { Editor } from '@tiptap/react';

export interface TextSelection {
    start: number;
    end: number;
    text: string;
}

export interface AISuggestion {
    id: string;
    originalText: string;
    suggestedText: string;
    selection: TextSelection;
    reasoning?: string;
}

export interface EditorState {
    content: string;
    selection: TextSelection | null;
    aiSuggestion: AISuggestion | null;
    isProcessing: boolean;
    editorRef: Editor | null; // TipTap editor instance
    error: string | null;
    
    // Actions
    setContent: (content: string) => void;
    setSelection: (selection: TextSelection | null) => void;
    setEditorRef: (editor: Editor) => void;
    clearError: () => void;
    requestAISuggestion: (prompt: string) => Promise<void>;
    acceptSuggestion: () => void;
    rejectSuggestion: () => void;
    autoApplySuggestion: (suggestion: AISuggestion) => void;
}