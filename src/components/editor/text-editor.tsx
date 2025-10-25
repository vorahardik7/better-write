'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EditorContent } from '@tiptap/react';

import { useTipTapEditor } from '@/lib/tiptap-config';

import { useEditorStore } from '@/lib/store/editor-store';
import { AICommandPalette } from './ai-command-palette';
import { KeyboardShortcutsPanel } from './keyboard-shortcuts-panel';
import { MousePointer, Bold, Italic, Image as ImageIcon, AlertCircle, X, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo2, Redo2, Underline as UnderlineIcon, Link2, Link2Off, MoreHorizontal } from 'lucide-react';
import { 
  formattingActions, 
  alignmentActions, 
  undoRedoActions, 
  createLinkActions, 
  linkHelpers,
  imageActions, 
  imageHandlers, 
  createKeyboardShortcutHandlers 
} from './actions';

export function TextEditor() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [showShortcutsPanel, setShowShortcutsPanel] = useState(false);
  const [linkState, setLinkState] = useState({
    showLinkDialog: false,
    linkUrl: '',
    linkText: ''
  });
  
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
    content || { type: 'doc', content: [{ type: 'paragraph', content: [] }] },
    ({ editor }) => {
      setContent(editor.getJSON());
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
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Derived stats
  const plainText = editor?.getText() || '';
  const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const readingTimeMin = Math.max(1, Math.ceil(words / 200));
  const selectedChars = selection?.text?.length || 0;

  // Create action handlers
  const linkActions = createLinkActions(editor, linkState, setLinkState);
  const keyboardHandlers = createKeyboardShortcutHandlers(
    editor, 
    selection, 
    () => setShowCommandPalette(true), 
    () => setShowCommandPalette(false)
  );

  // Image handlers
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    if (editor) imageHandlers.handlePaste(editor, e);
  }, [editor]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (editor) imageHandlers.handleDrop(editor, e);
  }, [editor]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    imageHandlers.handleDragOver(e);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keyboardHandlers.handleKeyDown(e);
  }, [keyboardHandlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Toolbar actions
  const addImage = () => {
    if (editor) imageActions.promptForImageUrl(editor);
  };

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center bg-[#fefae0] text-[rgb(87,73,55)]">
        Loading editor...
      </div>
    );
  }

  const baseToolbarButton = 'inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgba(136,153,79,0.35)] focus:ring-offset-1 focus:ring-offset-[#f7f3e5] disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer';
  const activeToolbarButton = 'bg-[rgb(136,153,79)] border-[rgb(136,153,79)] text-white shadow-[0_12px_28px_rgba(136,153,79,0.24)]';
  const inactiveToolbarButton = 'bg-[#fbf7ec] border-[rgba(136,153,79,0.3)] text-[rgb(90,78,60)] hover:bg-[#fefae2] hover:border-[rgba(136,153,79,0.45)]';

  return (
    <div className="h-full flex flex-col">
      {/* Formatting Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between px-6 py-3 bg-[#f7f3e5] border-b border-[rgba(136,153,79,0.15)] backdrop-blur-sm overflow-x-auto shadow-[0_8px_26px_rgba(136,153,79,0.12)]"
      >
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 border-r border-[rgba(136,153,79,0.2)] pr-3">
            <button
              onClick={() => editor && undoRedoActions.undo(editor)}
              className={`${baseToolbarButton} ${inactiveToolbarButton}`}
              aria-label="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor && undoRedoActions.redo(editor)}
              className={`${baseToolbarButton} ${inactiveToolbarButton}`}
              aria-label="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-[rgba(136,153,79,0.2)] pr-3">
            <button
              onClick={() => editor && formattingActions.toggleBold(editor)}
              className={`${baseToolbarButton} ${formattingActions.isActive.bold(editor) ? activeToolbarButton : inactiveToolbarButton}`}
              aria-label="Bold"
              aria-pressed={formattingActions.isActive.bold(editor)}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor && formattingActions.toggleItalic(editor)}
              className={`${baseToolbarButton} ${formattingActions.isActive.italic(editor) ? activeToolbarButton : inactiveToolbarButton}`}
              aria-label="Italic"
              aria-pressed={formattingActions.isActive.italic(editor)}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor && formattingActions.toggleUnderline(editor)}
              className={`${baseToolbarButton} ${formattingActions.isActive.underline(editor) ? activeToolbarButton : inactiveToolbarButton}`}
              aria-label="Underline"
              aria-pressed={formattingActions.isActive.underline(editor)}
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={linkActions.toggleLink}
              className={`${baseToolbarButton} ${linkHelpers.isActive(editor) ? activeToolbarButton : inactiveToolbarButton}`}
              aria-label={linkHelpers.isActive(editor) ? 'Remove Link' : 'Add Link'}
              aria-pressed={linkHelpers.isActive(editor)}
            >
              {linkHelpers.isActive(editor) ? <Link2Off className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-[rgba(136,153,79,0.2)] pr-3">
            <button
              onClick={() => editor && alignmentActions.setTextAlignment(editor, 'left')}
              className={`${baseToolbarButton} ${alignmentActions.isActive(editor, 'left') ? activeToolbarButton : inactiveToolbarButton}`}
              aria-pressed={alignmentActions.isActive(editor, 'left')}
              disabled={!alignmentActions.canSetTextAlignment(editor, 'left')}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor && alignmentActions.setTextAlignment(editor, 'center')}
              className={`${baseToolbarButton} ${alignmentActions.isActive(editor, 'center') ? activeToolbarButton : inactiveToolbarButton}`}
              aria-pressed={alignmentActions.isActive(editor, 'center')}
              disabled={!alignmentActions.canSetTextAlignment(editor, 'center')}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor && alignmentActions.setTextAlignment(editor, 'right')}
              className={`${baseToolbarButton} ${alignmentActions.isActive(editor, 'right') ? activeToolbarButton : inactiveToolbarButton}`}
              aria-pressed={alignmentActions.isActive(editor, 'right')}
              disabled={!alignmentActions.canSetTextAlignment(editor, 'right')}
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor && alignmentActions.setTextAlignment(editor, 'justify')}
              className={`${baseToolbarButton} ${alignmentActions.isActive(editor, 'justify') ? activeToolbarButton : inactiveToolbarButton}`}
              aria-pressed={alignmentActions.isActive(editor, 'justify')}
              disabled={!alignmentActions.canSetTextAlignment(editor, 'justify')}
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Insert Elements */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={addImage}
              className={`${baseToolbarButton} ${inactiveToolbarButton}`}
              aria-label="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile More Menu */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setShowMobileMore(v => !v)}
              className={`${baseToolbarButton} ${inactiveToolbarButton}`}
              aria-label="More"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMobileMore && (
              <div className="absolute z-20 mt-2 left-0 bg-[#fefae0] border border-[rgba(136,153,79,0.22)] rounded-xl shadow-[0_16px_28px_rgba(136,153,79,0.18)] p-2 grid grid-cols-2 gap-1">
                <button onClick={addImage} className={`${baseToolbarButton} ${inactiveToolbarButton}`} aria-label="Insert Image">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setShowMobileMore(false)} className={`${baseToolbarButton} ${inactiveToolbarButton}`} aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Document Stats - Right Side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[rgb(87,73,55)] bg-[#fbf5e6] px-3 py-1.5 rounded-full border border-[rgba(136,153,79,0.2)]">
            <MousePointer className="w-3 h-3 text-[rgb(136,153,79)]" />
            <span className="font-medium">Select text and press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-[rgba(136,153,79,0.35)] rounded text-[10px] font-semibold shadow-sm text-[rgb(72,84,42)]">⌘K</kbd>
            <span className="font-medium">for AI</span>
          </div>
          
          <div className="text-xs text-[rgb(87,73,55)] font-semibold flex items-center gap-3">
            <span>{editor?.getText().length || 0} chars</span>
            <span className="text-[rgba(136,153,79,0.45)]">•</span>
            <span>{editor?.getText().split(/\s+/).filter(w => w.length > 0).length || 0} words</span>
            <span className="text-[rgba(136,153,79,0.45)]">•</span>
            <span>{readingTimeMin} min</span>
            {selectedChars > 0 && (
              <>
                <span className="text-[rgba(136,153,79,0.45)]">•</span>
                <span className="text-[rgb(136,153,79)]">{selectedChars} selected</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Rich Text Editor */}
      <div className="flex-1 relative bg-[#fefae0] overflow-auto" onPaste={handlePaste} onDrop={handleDrop} onDragOver={handleDragOver}>
        <div className="max-w-4xl mx-auto px-8 py-12 h-full">
          <div className="bg-[#fffdf3] rounded-2xl shadow-[0_24px_56px_rgba(136,153,79,0.22)] border border-[rgba(136,153,79,0.22)] min-h-[calc(100vh-16rem)] p-12">
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


      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 max-w-md"
          >
            <div className="p-4 bg-[#fef7f7] border border-[rgba(213,85,85,0.25)] rounded-xl flex items-start gap-3 shadow-[0_18px_34px_rgba(213,85,85,0.18)]">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="p-1 hover:bg-[rgba(213,85,85,0.1)] rounded-lg transition-colors flex-shrink-0"
                aria-label="Close error"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowShortcutsPanel(true)}
          className="w-12 h-12 bg-[rgb(136,153,79)] hover:bg-[rgb(118,132,68)] text-white rounded-full shadow-[0_18px_40px_rgba(136,153,79,0.35)] transition-all duration-200 flex items-center justify-center hover:scale-110 cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <kbd className="text-xs font-semibold">?</kbd>
        </button>
      </div>

      {/* Link Dialog */}
      <AnimatePresence>
        {linkState.showLinkDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={linkActions.handleLinkCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#fffdf3] rounded-2xl p-6 w-full max-w-md mx-4 shadow-[0_26px_60px_rgba(136,153,79,0.22)] border border-[rgba(136,153,79,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[rgb(72,84,42)]">Add Link</h3>
                <button
                  onClick={linkActions.handleLinkCancel}
                  className="p-1 hover:bg-[rgba(136,153,79,0.12)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[rgba(96,108,58,0.75)]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[rgb(87,73,55)] mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={linkState.linkUrl}
                    onChange={(e) => linkActions.setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-[rgba(136,153,79,0.28)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(136,153,79,0.35)] focus:border-[rgba(136,153,79,0.55)] bg-white text-[rgb(72,84,42)] placeholder-[rgba(136,153,79,0.6)]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[rgb(87,73,55)] mb-2">
                    Link Text (optional)
                  </label>
                  <input
                    type="text"
                    value={linkState.linkText}
                    onChange={(e) => linkActions.setLinkText(e.target.value)}
                    placeholder="Display text for the link"
                    className="w-full px-3 py-2 border border-[rgba(136,153,79,0.28)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(136,153,79,0.35)] focus:border-[rgba(136,153,79,0.55)] bg-white text-[rgb(72,84,42)] placeholder-[rgba(136,153,79,0.6)]"
                  />
                  {linkState.linkText.trim() === '' && (
                    <p className="text-xs text-[rgba(96,108,58,0.75)] mt-1">
                      If empty, the URL will be used as the link text
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[rgba(136,153,79,0.18)]">
                <button
                  onClick={linkActions.handleLinkCancel}
                  className="px-4 py-2 text-sm font-semibold text-[rgb(87,73,55)] hover:bg-[rgba(136,153,79,0.12)] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={linkActions.handleLinkSubmit}
                  disabled={!linkState.linkUrl.trim()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[rgb(136,153,79)] hover:bg-[rgb(118,132,68)] disabled:bg-[rgba(136,153,79,0.4)] disabled:cursor-not-allowed rounded-lg transition-colors shadow-[0_14px_30px_rgba(136,153,79,0.25)]"
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


