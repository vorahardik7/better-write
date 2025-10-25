import type { Editor } from '@tiptap/react';

export const undoRedoActions = {
  undo: (editor: Editor) => {
    editor?.chain().focus().undo().run();
  },

  redo: (editor: Editor) => {
    editor?.chain().focus().redo().run();
  }
};
