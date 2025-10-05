'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EditorContent } from '@tiptap/react';

import { useTipTapEditor } from '@/lib/tiptap-config';

import { useEditorStore } from '@/lib/store/editor-store';
import { AICommandPalette } from './ai-command-palette';
import { AISuggestionOverlay } from './ai-suggestion-overlay';
import { KeyboardShortcutsPanel } from './keyboard-shortcuts-panel';
import { MousePointer, Bold, Italic, Image as ImageIcon, AlertCircle, X, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo2, Redo2, Underline as UnderlineIcon, Link2, Link2Off, MoreHorizontal } from 'lucide-react';

export function DemoTextEditor() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showShortcutsPanel, setShowShortcutsPanel] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const { 
    content, 
    setContent, 
    setSelection, 
    setEditorRef,
    selection,
    error,
    clearError
  } = useEditorStore();

  const editor = useTipTapEditor(
    content,
    ({ editor }) => {
      setContent(editor.getHTML());
    },
    ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to);
        setSelection({
          start: from,
          end: to,
          text: selectedText,
        });
      } else {
        setSelection(null);
      }
    }
  );

  // Set editor reference in store when editor is ready
  useEffect(() => {
    if (editor) {
      setEditorRef(editor);
    }
  }, [editor, setEditorRef]);

  // Update editor content when store content changes (for AI suggestions)
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Derived stats
  const plainText = editor?.getText() || '';
  const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const readingTimeMin = Math.max(1, Math.ceil(words / 200));
  const selectedChars = selection?.text?.length || 0;

  // Text alignment helper functions
  const setTextAlignment = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (!editor) return;
    try {
      // Type assertion for TipTap TextAlign extension commands
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor.chain().focus() as any).setTextAlign(alignment).run();
    } catch {
      console.warn('Text alignment not supported');
    }
  }, [editor]);

  const canSetTextAlignment = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (!editor) return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (editor.can() as any).setTextAlign(alignment);
    } catch {
      return false;
    }
  }, [editor]);

  // Toolbar and formatting actions
  const handleUndo = () => editor?.chain().focus().undo().run();
  const handleRedo = () => editor?.chain().focus().redo().run();
  const handleToggleUnderline = () => {
    if (editor) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (editor.chain().focus() as any).toggleUnderline().run();
      } catch {
        console.warn('Underline not supported');
      }
    }
  };
  const handleToggleLink = () => {
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

    setLinkUrl(previousUrl);
    setLinkText(previousText);
    setShowLinkDialog(true);
  };

  const handleLinkSubmit = () => {
    if (!editor || !linkUrl.trim()) return;

    try {
      if (linkText.trim()) {
        // Insert link with custom text
        editor.chain().focus().insertContent(`<a href="${linkUrl.trim()}">${linkText.trim()}</a>`).run();
      } else {
        // Insert link with URL as text
        editor.chain().focus().insertContent(`<a href="${linkUrl.trim()}">${linkUrl.trim()}</a>`).run();
      }
    } catch {
      console.warn('Link insertion failed');
    }

    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleLinkCancel = () => {
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Paste / Drag image handlers
  const insertImageFromFile = useCallback((file: File) => {
    if (!editor) return;
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
  }, [editor]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) insertImageFromFile(file);
      }
    }
  }, [insertImageFromFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      insertImageFromFile(files[i]);
    }
  }, [insertImageFromFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K to open AI command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (selection) {
        setShowCommandPalette(true);
      }
    }
    
    // Text alignment shortcuts
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && editor) {
      switch (e.key.toLowerCase()) {
        case 'l':
          e.preventDefault();
          setTextAlignment('left');
          break;
        case 'e':
          e.preventDefault();
          setTextAlignment('center');
          break;
        case 'r':
          e.preventDefault();
          setTextAlignment('right');
          break;
        case 'j':
          e.preventDefault();
          setTextAlignment('justify');
          break;
      }
    }
    
    // Escape to close command palette
    if (e.key === 'Escape') {
      setShowCommandPalette(false);
    }
  }, [selection, editor, setTextAlignment]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Toolbar actions

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      // Simple image insertion
      editor.chain().focus().insertContent(`<img src="${url}" alt="Image" class="rounded-lg shadow-sm max-w-full h-auto" />`).run();
    }
  };

  if (!editor) {
    return <div className="h-full flex items-center justify-center">Loading editor...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 shadow-sm"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700 flex-1">{error}</span>
            <button
              onClick={clearError}
              className="btn-toolbar"
            >
              <div className="btn-shadow"></div>
              <div className="btn-edge"></div>
              <div className="btn-front">
                <X className="w-3 h-3 text-red-600" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formatting Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between px-6 py-3 bg-white border-b border-black/5 overflow-x-auto"
      >
        {/* Formatting Tools - Left Side */}
        <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={handleUndo}
            className="btn-toolbar"
            aria-label="Undo"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Undo2 className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={handleRedo}
            className="btn-toolbar"
            aria-label="Redo"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Redo2 className="w-4 h-4 text-slate-600" />
            </div>
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`btn-toolbar ${editor?.isActive('bold') ? 'btn-active' : ''} cursor-pointer`}
            aria-label="Bold"
            aria-pressed={!!editor?.isActive('bold')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Bold className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`btn-toolbar ${editor?.isActive('italic') ? 'btn-active' : ''} cursor-pointer`}
            aria-label="Italic"
            aria-pressed={!!editor?.isActive('italic')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Italic className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={handleToggleUnderline}
            className={`btn-toolbar ${editor?.isActive('underline') ? 'btn-active' : ''} cursor-pointer`}
            aria-label="Underline"
            aria-pressed={!!editor?.isActive('underline')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <UnderlineIcon className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={handleToggleLink}
            className={`btn-toolbar ${editor?.isActive('link') ? 'btn-active' : ''} cursor-pointer`}
            aria-label={editor?.isActive('link') ? 'Remove Link' : 'Add Link'}
            aria-pressed={!!editor?.isActive('link')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              {editor?.isActive('link') ? <Link2Off className="w-4 h-4 text-slate-600" /> : <Link2 className="w-4 h-4 text-slate-600" />}
            </div>
          </button>
        </div>



        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => setTextAlignment('left')}
            className={`btn-toolbar ${editor?.isActive({ textAlign: 'left' }) ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive({ textAlign: 'left' })}
            disabled={!canSetTextAlignment('left')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <AlignLeft className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={() => setTextAlignment('center')}
            className={`btn-toolbar ${editor?.isActive({ textAlign: 'center' }) ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive({ textAlign: 'center' })}
            disabled={!canSetTextAlignment('center')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <AlignCenter className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={() => setTextAlignment('right')}
            className={`btn-toolbar ${editor?.isActive({ textAlign: 'right' }) ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive({ textAlign: 'right' })}
            disabled={!canSetTextAlignment('right')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <AlignRight className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={() => setTextAlignment('justify')}
            className={`btn-toolbar ${editor?.isActive({ textAlign: 'justify' }) ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive({ textAlign: 'justify' })}
            disabled={!canSetTextAlignment('justify')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <AlignJustify className="w-4 h-4 text-slate-600" />
            </div>
          </button>
        </div>

        {/* Insert Elements */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={addImage}
            className="btn-toolbar"
            aria-label="Insert Image"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <ImageIcon className="w-4 h-4 text-slate-600" />
            </div>
          </button>
        </div>

        {/* Mobile More Menu */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setShowMobileMore(v => !v)}
            className="btn-toolbar"
            aria-label="More"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <MoreHorizontal className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          {showMobileMore && (
            <div className="absolute z-20 mt-2 left-0 bg-white border border-gray-200 rounded-md shadow-lg p-2 grid grid-cols-2 gap-1">
              <button onClick={addImage} className="btn-toolbar" aria-label="Insert Image">
                <div className="btn-shadow"></div>
                <div className="btn-edge"></div>
                <div className="btn-front"><ImageIcon className="w-4 h-4 text-slate-600" /></div>
              </button>
              <button onClick={() => setShowMobileMore(false)} className="btn-toolbar" aria-label="Close">
                <div className="btn-shadow"></div>
                <div className="btn-edge"></div>
                <div className="btn-front"><X className="w-4 h-4 text-slate-600" /></div>
              </button>
            </div>
          )}
        </div>

        </div>

        {/* Document Stats - Right Side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <MousePointer className="w-3 h-3 text-slate-600" />
            <span className="font-medium">Select text and press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-semibold shadow-sm text-slate-700">⌘K</kbd>
            <span className="font-medium">for AI</span>
          </div>
          
          <div className="text-xs text-slate-600 font-semibold flex items-center gap-3">
            <span>{editor?.getText().length || 0} chars</span>
            <span className="text-slate-300">•</span>
            <span>{editor?.getText().split(/\s+/).filter(w => w.length > 0).length || 0} words</span>
            <span className="text-slate-300">•</span>
            <span>{readingTimeMin} min</span>
            {selectedChars > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-blue-600">{selectedChars} selected</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Rich Text Editor */}
      <div className="flex-1 relative bg-[#f5f4f0] overflow-auto" onPaste={handlePaste} onDrop={handleDrop} onDragOver={handleDragOver}>
        <div className="max-w-4xl mx-auto px-8 py-12 h-full">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 min-h-[calc(100vh-16rem)] p-12">
            <EditorContent 
              editor={editor}
              className="prose prose-lg max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[600px]"
              style={{
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>
        </div>
        
      </div>

      {/* AI Command Palette */}
      <AICommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        selectedText={selection?.text || ''}
      />

      {/* AI Suggestion Overlay */}
      <AISuggestionOverlay />

      {/* Keyboard Shortcuts Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowShortcutsPanel(true)}
          className="w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <kbd className="text-xs font-semibold">?</kbd>
        </button>
      </div>

      {/* Link Dialog */}
      <AnimatePresence>
        {showLinkDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleLinkCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Add Link</h3>
                <button
                  onClick={handleLinkCancel}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Link Text (optional)
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Display text for the link"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {linkText.trim() === '' && (
                    <p className="text-xs text-slate-500 mt-1">
                      If empty, the URL will be used as the link text
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleLinkCancel}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkSubmit}
                  disabled={!linkUrl.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Add Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        isOpen={showShortcutsPanel}
        onClose={() => setShowShortcutsPanel(false)}
      />
    </div>
  );
}


