'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

import { useEditorStore } from '@/lib/store/editor-store';
import { AICommandPalette } from './ai-command-palette';
import { AISuggestionOverlay } from './ai-suggestion-overlay';
import { Sparkles, Zap, Type, MousePointer, Bold, Italic, List, ListOrdered, Quote, Table as TableIcon, Image as ImageIcon, Heading1, Heading2, Heading3, AlertCircle, X, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo2, Redo2, Underline as UnderlineIcon, Link2, Link2Off, Eraser, MoreHorizontal } from 'lucide-react';

export function DemoTextEditor() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const { 
    content, 
    setContent, 
    setSelection, 
    setEditorRef,
    selection,
    error,
    clearError
  } = useEditorStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg shadow-sm max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline underline-offset-2 hover:text-blue-700 cursor-pointer',
        },
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
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
    },
  });

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
    const previousUrl = (editor.getAttributes('link')?.href as string | undefined) ?? undefined;
    const url = window.prompt('Enter URL', previousUrl ?? 'https://');
    if (!url) return;
    try {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } catch {
      console.warn('Link not supported');
    }
  };
  const handleClearFormatting = () => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
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
  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

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
          <button
            onClick={handleClearFormatting}
            className="btn-toolbar cursor-pointer"
            aria-label="Clear formatting"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Eraser className="w-4 h-4 text-slate-600" />
            </div>
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`btn-toolbar ${editor?.isActive('heading', { level: 1 }) ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive('heading', { level: 1 })}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Heading1 className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`btn-toolbar ${editor?.isActive('heading', { level: 2 }) ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive('heading', { level: 2 })}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Heading2 className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`btn-toolbar ${editor?.isActive('heading', { level: 3 }) ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive('heading', { level: 3 })}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Heading3 className="w-4 h-4 text-slate-600" />
            </div>
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`btn-toolbar ${editor?.isActive('bulletList') ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive('bulletList')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <List className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`btn-toolbar ${editor?.isActive('orderedList') ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive('orderedList')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <ListOrdered className="w-4 h-4 text-slate-600" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`btn-toolbar ${editor?.isActive('blockquote') ? 'btn-active' : ''} cursor-pointer`}
            aria-pressed={!!editor?.isActive('blockquote')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Quote className="w-4 h-4 text-slate-600" />
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
            onClick={addTable}
            className="btn-toolbar"
            aria-label="Insert Table"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <TableIcon className="w-4 h-4 text-slate-600" />
            </div>
          </button>
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
            <div className="absolute z-20 mt-2 left-0 bg-white border border-gray-200 rounded-md shadow-lg p-2 grid grid-cols-3 gap-1">
              <button onClick={addTable} className="btn-toolbar" aria-label="Insert Table">
                <div className="btn-shadow"></div>
                <div className="btn-edge"></div>
                <div className="btn-front"><TableIcon className="w-4 h-4 text-slate-600" /></div>
              </button>
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

        {/* Table Controls - Show only when inside a table */}
        {editor?.isActive('table') && (
          <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
            <button
              onClick={() => editor?.chain().focus().addColumnBefore().run()}
              className="btn-toolbar"
              title="Add Column Before"
            >
              <div className="btn-shadow"></div>
              <div className="btn-edge"></div>
              <div className="btn-front">
                <span className="text-xs font-medium text-slate-600">Col+</span>
              </div>
            </button>
            <button
              onClick={() => editor?.chain().focus().addRowBefore().run()}
              className="btn-toolbar"
              title="Add Row Before"
            >
              <div className="btn-shadow"></div>
              <div className="btn-edge"></div>
              <div className="btn-front">
                <span className="text-xs font-medium text-slate-600">Row+</span>
              </div>
            </button>
            <button
              onClick={() => editor?.chain().focus().deleteColumn().run()}
              className="btn-toolbar"
              title="Delete Column"
            >
              <div className="btn-shadow"></div>
              <div className="btn-edge"></div>
              <div className="btn-front text-red-400">
                <span className="text-xs font-medium">Col-</span>
              </div>
            </button>
            <button
              onClick={() => editor?.chain().focus().deleteRow().run()}
              className="btn-toolbar"
              title="Delete Row"
            >
              <div className="btn-shadow"></div>
              <div className="btn-edge"></div>
              <div className="btn-front text-red-400">
                <span className="text-xs font-medium">Row-</span>
              </div>
            </button>
            <button
              onClick={() => editor?.chain().focus().deleteTable().run()}
              className="btn-toolbar"
              title="Delete Table"
            >
              <div className="btn-shadow"></div>
              <div className="btn-edge"></div>
              <div className="btn-front text-red-400">
                <span className="text-xs font-medium">Del</span>
              </div>
            </button>
          </div>
        )}
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
        
        {/* Welcome Guide */}
        <AnimatePresence>
          {editor.getText().length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 max-w-2xl pointer-events-none z-10"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-black/10">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-900 p-3 rounded-xl flex-shrink-0 shadow-md">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">Welcome to BetterWrite!</h3>
                    <p className="text-slate-700 text-sm font-medium leading-relaxed mb-4">
                      Create professional documents with AI-powered assistance. 
                      Select any text and press <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm text-slate-700">⌘K</kbd> for instant AI suggestions.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-slate-700" />
                        AI-powered editing
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>Rich formatting</span>
                      <span className="text-slate-300">•</span>
                      <span>Smart suggestions</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Command Palette */}
      <AICommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        selectedText={selection?.text || ''}
      />

      {/* AI Suggestion Overlay */}
      <AISuggestionOverlay />
    </div>
  );
}


