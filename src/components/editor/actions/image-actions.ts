import type { Editor } from '@tiptap/react';

export const imageActions = {
  insertImageFromUrl: (editor: Editor, url: string) => {
    if (!url) return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor.chain().focus() as any).setImage?.({ src: url }).run();
    } catch {
      editor.chain().focus().insertContent(`<img src="${url}" alt="Image" class="rounded-lg shadow-sm max-w-full h-auto" />`).run();
    }
  },

  insertImageFromFile: (editor: Editor, file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (editor.chain().focus() as any).setImage?.({ src }).run();
      } catch {
        editor.chain().focus().insertContent(`<img src="${src}" alt="Image" class="rounded-lg shadow-sm max-w-full h-auto" />`).run();
      }
    };
    reader.readAsDataURL(file);
  },

  promptForImageUrl: (editor: Editor) => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      imageActions.insertImageFromUrl(editor, url);
    }
  }
};

export const imageHandlers = {
  handlePaste: (editor: Editor, e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) imageActions.insertImageFromFile(editor, file);
      }
    }
  },

  handleDrop: (editor: Editor, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      imageActions.insertImageFromFile(editor, files[i]);
    }
  },

  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }
};
