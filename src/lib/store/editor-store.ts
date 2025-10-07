import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Editor } from "@tiptap/react";
import type { TextSelection, AISuggestion, EditorState } from "@/types/editor";

export const useEditorStore = create<EditorState>((set, get) => ({
    // Initial state
    content:
        "<h1>Welcome to better-write!</h1><p>Start writing your document with rich formatting, tables, images, and AI assistance.</p><p>Select any text and press <kbd>⌘K</kbd> to get instant AI suggestions for improvement.</p><blockquote><p>This is the future of document editing - where AI understands your intent and helps you write better.</p></blockquote>",
    selection: null,
    aiSuggestion: null,
    isProcessing: false,
    editorRef: null,
    error: null,

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

    clearError: () => {
        set({ error: null });
    },

    requestAISuggestion: async (prompt: string) => {
        const { selection, editorRef } = get();
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

            // Convert markdown to HTML for TipTap
            const htmlContent = convertMarkdownToHTML(suggestedText);

            editorRef
                .chain()
                .focus()
                .insertContent(htmlContent, {
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
            const htmlContent = convertMarkdownToHTML(suggestedText);
            editorRef
                .chain()
                .focus()
                .insertContent(htmlContent, {
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

// Convert markdown to HTML for TipTap
function convertMarkdownToHTML(markdown: string): string {
    let html = markdown;

    // Bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Italic text
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Headers
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Unordered lists
    html = html.replace(/^(\s*)- (.+)$/gm, (match, indent, text) => {
        const level = indent.length / 2;
        return `${"  ".repeat(level)}<li>${text}</li>`;
    });

    // Wrap consecutive list items in <ul> tags
    html = html.replace(/((?:\s*<li>.*<\/li>\s*)+)/g, "<ul>$1</ul>");

    // Ordered lists
    html = html.replace(/^(\s*)\d+\. (.+)$/gm, (match, indent, text) => {
        const level = indent.length / 2;
        return `${"  ".repeat(level)}<li>${text}</li>`;
    });

    // Wrap consecutive ordered list items in <ol> tags
    html = html.replace(/((?:\s*<li>.*<\/li>\s*)+)/g, (match) => {
        // Check if this was from numbered lists (this is a simplified approach)
        return match.includes("1.") ? `<ol>${match}</ol>` : `<ul>${match}</ul>`;
    });

    // Paragraphs (convert double line breaks to paragraphs)
    html = html.replace(/\n\n+/g, "</p><p>");

    // Wrap content in paragraph tags if it doesn't start with a block element
    if (!html.match(/^<(h[1-6]|ul|ol|pre|blockquote)/)) {
        html = `<p>${html}</p>`;
    }

    // Clean up extra paragraph tags around block elements
    html = html.replace(
        /<p>(<(h[1-6]|ul|ol|pre|blockquote)[^>]*>.*?<\/\2>)<\/p>/g,
        "$1"
    );

    return html;
}
