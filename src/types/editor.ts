import type { Editor } from '@tiptap/react';

// TipTap content types
export interface TipTapMark {
    type: string;
    attrs?: Record<string, unknown>;
}

export interface TipTapNode {
    type: string;
    content?: TipTapNode[];
    text?: string;
    marks?: TipTapMark[];
    attrs?: Record<string, unknown>;
}

export interface TipTapContent {
    type: string;
    content: TipTapNode[];
}

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
    content: TipTapContent | null; // Changed to handle JSON content
    title: string;
    documentId: string | null;
    selection: TextSelection | null;
    aiSuggestion: AISuggestion | null;
    isProcessing: boolean;
    editorRef: Editor | null; // TipTap editor instance
    error: string | null;
    hasUnsavedChanges: boolean;

    // Actions
    setContent: (content: TipTapContent | null) => void;
    setTitle: (title: string) => void;
    setDocumentId: (documentId: string | null) => void;
    setSelection: (selection: TextSelection | null) => void;
    setEditorRef: (editor: Editor) => void;
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
    clearError: () => void;
    requestAISuggestion: (prompt: string) => Promise<void>;
    acceptSuggestion: () => void;
    rejectSuggestion: () => void;
    autoApplySuggestion: (suggestion: AISuggestion) => void;
}