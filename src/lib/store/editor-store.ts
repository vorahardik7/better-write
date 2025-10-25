import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Editor } from "@tiptap/react";
import type { TextSelection, AISuggestion, EditorState } from "@/types/editor";

export const useEditorStore = create<EditorState>((set, get) => ({
    // Initial state
    content: null, // Changed to null to handle JSON content
    title: "Untitled Document",
    documentId: null,
    selection: null,
    aiSuggestion: null,
    isProcessing: false,
    editorRef: null,
    error: null,
    hasUnsavedChanges: false,

    // Actions
    setContent: (content: any) => { // Changed to any to handle JSON objects
        set({ content, hasUnsavedChanges: true });
    },

    setTitle: (title: string) => {
        set({ title, hasUnsavedChanges: true });
    },

    setDocumentId: (documentId: string | null) => {
        set({ documentId, hasUnsavedChanges: false });
    },

    setSelection: (selection: TextSelection | null) => {
        set({ selection });
    },

    setEditorRef: (editor: Editor) => {
        set({ editorRef: editor });
    },

    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => {
        set({ hasUnsavedChanges });
    },

    clearError: () => {
        set({ error: null });
    },

    requestAISuggestion: async (prompt: string) => {
        const { selection, editorRef, documentId } = get();
        if (!selection || !editorRef) {
            set({
                error: "Please select text before requesting AI assistance",
            });
            return;
        }

        // Clear any previous errors
        set({ isProcessing: true, error: null });

        try {
            // Get plain text context for the API
            const documentContext = editorRef.getText();

            // Create AbortController for request cancellation
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const response = await fetch("/api/edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    selectedText: selection.text,
                    prompt: prompt,
                    documentContext: documentContext,
                    documentId: documentId, // Include for Supermemory context
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || `API error: ${response.status}`
                );
            }

            const data = await response.json();

            if (!data.suggestedText) {
                throw new Error("Invalid response from AI service");
            }

            const suggestion: AISuggestion = {
                id: nanoid(),
                originalText: selection.text,
                suggestedText: data.suggestedText,
                selection,
                reasoning: `Applied: "${prompt}"`,
            };

            // Auto-apply the suggestion immediately
            get().autoApplySuggestion(suggestion);
        } catch (error) {
            console.error("AI suggestion request failed:", error);

            let errorMessage = "Failed to get AI suggestion. Please try again.";

            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    errorMessage = "Request timed out. Please try again.";
                } else if (error.message.includes("API key")) {
                    errorMessage =
                        "AI service is not configured. Please contact support.";
                } else if (error.message.includes("rate limit")) {
                    errorMessage =
                        "Too many requests. Please wait a moment and try again.";
                } else if (error.message) {
                    errorMessage = error.message;
                }
            }

            set({ error: errorMessage });
        } finally {
            set({ isProcessing: false });
        }
    },

    acceptSuggestion: () => {
        const { editorRef, aiSuggestion } = get();
        if (!aiSuggestion || !editorRef) return;

        try {
            const { selection, suggestedText } = aiSuggestion;

            // Clear current selection first
            editorRef
                .chain()
                .focus()
                .setTextSelection({ from: selection.start, to: selection.end })
                .deleteSelection()
                .run();

            // Convert markdown to JSON for TipTap
            const jsonContent = convertMarkdownToJson(suggestedText);

            editorRef
                .chain()
                .focus()
                .insertContent(jsonContent, {
                    parseOptions: {
                        preserveWhitespace: "full",
                    },
                })
                .run();

            set({
                aiSuggestion: null,
                selection: null,
                error: null,
            });
        } catch (error) {
            console.error("Failed to apply suggestion:", error);
            set({ error: "Failed to apply suggestion. Please try again." });
        }
    },

    rejectSuggestion: () => {
        set({ aiSuggestion: null, error: null });
    },

    autoApplySuggestion: (suggestion: AISuggestion) => {
        const { editorRef } = get();
        if (!editorRef) return;

        try {
            const { selection, suggestedText } = suggestion;
            const { start, end } = selection;

            // Remove current selection
            editorRef
                .chain()
                .focus()
                .setTextSelection({ from: start, to: end })
                .deleteSelection()
                .run();

            // Insert the new content
            const jsonContent = convertMarkdownToJson(suggestedText);
            editorRef
                .chain()
                .focus()
                .insertContent(jsonContent, {
                    parseOptions: {
                        preserveWhitespace: "full",
                    },
                })
                .run();

            set({ aiSuggestion: null, selection: null, error: null });
        } catch (error) {
            console.error("Failed to auto-apply suggestion:", error);
            set({ error: "Failed to apply suggestion. Please try again." });
        }
    },
}));

// Convert markdown to TipTap JSON structure
function convertMarkdownToJson(markdown: string): any {
    if (!markdown.trim()) {
        return { type: 'doc', content: [{ type: 'paragraph', content: [] }] };
    }

    const lines = markdown.split('\n');
    const content: any[] = [];
    let currentList: any[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
            if (inList && currentList.length > 0) {
                content.push({
                    type: 'bulletList',
                    content: currentList
                });
                currentList = [];
                inList = false;
            }
            continue;
        }

        // Headers
        if (line.startsWith('### ')) {
            content.push({
                type: 'heading',
                attrs: { level: 3 },
                content: [{ type: 'text', text: line.substring(4) }]
            });
        } else if (line.startsWith('## ')) {
            content.push({
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: line.substring(3) }]
            });
        } else if (line.startsWith('# ')) {
            content.push({
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: line.substring(2) }]
            });
        }
        // Lists
        else if (line.startsWith('- ')) {
            if (!inList) {
                inList = true;
                currentList = [];
            }
            currentList.push({
                type: 'listItem',
                content: [{
                    type: 'paragraph',
                    content: parseInlineMarkdown(line.substring(2))
                }]
            });
        }
        // Regular paragraphs
        else {
            if (inList && currentList.length > 0) {
                content.push({
                    type: 'bulletList',
                    content: currentList
                });
                currentList = [];
                inList = false;
            }
            content.push({
                type: 'paragraph',
                content: parseInlineMarkdown(line)
            });
        }
    }

    // Close any remaining list
    if (inList && currentList.length > 0) {
        content.push({
            type: 'bulletList',
            content: currentList
        });
    }

    return { type: 'doc', content };
}

// Parse inline markdown (bold, italic, etc.)
function parseInlineMarkdown(text: string): any[] {
    const nodes: any[] = [];
    let currentText = text;
    let currentIndex = 0;

    // Simple parsing for bold and italic
    const parts = currentText.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
    
    for (const part of parts) {
        if (!part) continue;
        
        if (part.startsWith('**') && part.endsWith('**')) {
            nodes.push({
                type: 'text',
                text: part.slice(2, -2),
                marks: [{ type: 'bold' }]
            });
        } else if (part.startsWith('*') && part.endsWith('*')) {
            nodes.push({
                type: 'text',
                text: part.slice(1, -1),
                marks: [{ type: 'italic' }]
            });
        } else {
            nodes.push({
                type: 'text',
                text: part
            });
        }
    }

    return nodes.length > 0 ? nodes : [{ type: 'text', text: currentText }];
}
