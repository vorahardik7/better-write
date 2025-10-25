import type { Editor } from '@tiptap/react';

export const alignmentActions = {
  setTextAlignment: (editor: Editor, alignment: 'left' | 'center' | 'right' | 'justify') => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor.chain().focus() as any).setTextAlign(alignment).run();
    } catch {
      console.warn('Text alignment not supported');
    }
  },

  canSetTextAlignment: (editor: Editor, alignment: 'left' | 'center' | 'right' | 'justify') => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (editor.can() as any).setTextAlign(alignment);
    } catch {
      return false;
    }
  },

  isActive: (editor: Editor, alignment: 'left' | 'center' | 'right' | 'justify') => {
    return editor?.isActive({ textAlign: alignment }) || false;
  }
};
