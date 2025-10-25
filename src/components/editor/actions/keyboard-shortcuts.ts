import type { Editor } from '@tiptap/react';
import { alignmentActions } from './alignment-actions';

export interface KeyboardShortcutHandlers {
  handleKeyDown: (e: KeyboardEvent) => void;
}

export const createKeyboardShortcutHandlers = (
  editor: Editor | null,
  selection: any,
  onCommandPaletteOpen: () => void,
  onCommandPaletteClose: () => void
): KeyboardShortcutHandlers => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K to open AI command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (selection) {
        onCommandPaletteOpen();
      }
    }
    
    // Text alignment shortcuts
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && editor) {
      switch (e.key.toLowerCase()) {
        case 'l':
          e.preventDefault();
          alignmentActions.setTextAlignment(editor, 'left');
          break;
        case 'e':
          e.preventDefault();
          alignmentActions.setTextAlignment(editor, 'center');
          break;
        case 'r':
          e.preventDefault();
          alignmentActions.setTextAlignment(editor, 'right');
          break;
        case 'j':
          e.preventDefault();
          alignmentActions.setTextAlignment(editor, 'justify');
          break;
      }
    }
    
    // Escape to close command palette
    if (e.key === 'Escape') {
      onCommandPaletteClose();
    }
  };

  return { handleKeyDown };
};
