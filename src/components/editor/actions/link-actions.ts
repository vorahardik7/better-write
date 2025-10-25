import type { Editor } from '@tiptap/react';
import React from 'react';

export interface LinkState {
  showLinkDialog: boolean;
  linkUrl: string;
  linkText: string;
}

export interface LinkActions {
  toggleLink: () => void;
  handleLinkSubmit: () => void;
  handleLinkCancel: () => void;
  setLinkUrl: (url: string) => void;
  setLinkText: (text: string) => void;
  setShowLinkDialog: (show: boolean) => void;
}

export const createLinkActions = (
  editor: Editor | null,
  linkState: LinkState,
  setLinkState: React.Dispatch<React.SetStateAction<LinkState>>
): LinkActions => {
  const toggleLink = () => {
    if (!editor) return;

    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    // Get current link attributes if editing existing link
    const previousUrl = (editor.getAttributes('link')?.href as string | undefined) ?? '';
    const previousText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    ) || '';

    setLinkState(prev => ({
      ...prev,
      linkUrl: previousUrl,
      linkText: previousText,
      showLinkDialog: true
    }));
  };

  const handleLinkSubmit = () => {
    if (!editor || !linkState.linkUrl.trim()) return;

    try {
      if (linkState.linkText.trim()) {
        // Insert link with custom text
        editor.chain().focus().insertContent(`<a href="${linkState.linkUrl.trim()}">${linkState.linkText.trim()}</a>`).run();
      } else {
        // Insert link with URL as text
        editor.chain().focus().insertContent(`<a href="${linkState.linkUrl.trim()}">${linkState.linkUrl.trim()}</a>`).run();
      }
    } catch {
      console.warn('Link insertion failed');
    }

    setLinkState(prev => ({
      ...prev,
      showLinkDialog: false,
      linkUrl: '',
      linkText: ''
    }));
  };

  const handleLinkCancel = () => {
    setLinkState(prev => ({
      ...prev,
      showLinkDialog: false,
      linkUrl: '',
      linkText: ''
    }));
  };

  return {
    toggleLink,
    handleLinkSubmit,
    handleLinkCancel,
    setLinkUrl: (url: string) => setLinkState(prev => ({ ...prev, linkUrl: url })),
    setLinkText: (text: string) => setLinkState(prev => ({ ...prev, linkText: text })),
    setShowLinkDialog: (show: boolean) => setLinkState(prev => ({ ...prev, showLinkDialog: show }))
  };
};

export const linkHelpers = {
  isActive: (editor: Editor) => editor?.isActive('link') || false,
  getCurrentUrl: (editor: Editor) => editor.getAttributes('link')?.href as string | undefined,
  getCurrentText: (editor: Editor) => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to) || '';
  }
};
