import type { Editor } from '@tiptap/react';

export const formattingActions = {
  toggleBold: (editor: Editor) => {
    editor?.chain().focus().toggleBold().run();
  },

  toggleItalic: (editor: Editor) => {
    editor?.chain().focus().toggleItalic().run();
  },

  toggleUnderline: (editor: Editor) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor.chain().focus() as any).toggleUnderline().run();
    } catch {
      console.warn('Underline not supported');
    }
  },

  isActive: {
    bold: (editor: Editor) => editor?.isActive('bold') || false,
    italic: (editor: Editor) => editor?.isActive('italic') || false,
    underline: (editor: Editor) => editor?.isActive('underline') || false,
  }
};
