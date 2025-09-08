'use client';

import { useCallback, useState, useEffect } from 'react';
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
import { Sparkles, Zap, Type, MousePointer, Bold, Italic, List, ListOrdered, Quote, Table as TableIcon, Image as ImageIcon, Heading1, Heading2, Heading3, AlertCircle, X, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

export function DemoTextEditor() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
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

      {/* Document Stats Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-8 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-100"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-md shadow-sm border border-gray-200">
            <Type className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-gray-900">Demo Document</span>
          </div>
          
          <motion.div
            className="text-xs text-gray-600 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>{editor?.getText().length || 0} characters</span>
            <span className="text-gray-300">•</span>
            <span>{editor?.getText().split(/\s+/).filter(w => w.length > 0).length || 0} words</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-700 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-200">
          <MousePointer className="w-3 h-3" />
          <span>Select text and press</span>
          <kbd className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px] font-mono shadow-sm text-blue-800">⌘K</kbd>
          <span>for AI suggestions</span>
        </div>
      </motion.div>

      {/* Formatting Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-100 overflow-x-auto"
      >
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`btn-toolbar ${editor?.isActive('bold') ? 'btn-active' : ''}`}
            title="Bold"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Bold className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`btn-toolbar ${editor?.isActive('italic') ? 'btn-active' : ''}`}
            title="Italic"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Italic className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => {
              if (editor) {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (editor.chain().focus() as any).toggleUnderline().run();
                } catch {
                  console.warn('Underline not supported');
                }
              }
            }}
            className={`btn-toolbar ${editor?.isActive('underline') ? 'btn-active' : ''}`}
            title="Underline"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Type className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`btn-toolbar ${editor?.isActive('heading', { level: 1 }) ? 'btn-active' : ''}`}
            title="Heading 1"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Heading1 className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`btn-toolbar ${editor?.isActive('heading', { level: 2 }) ? 'btn-active' : ''}`}
            title="Heading 2"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Heading2 className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`btn-toolbar ${editor?.isActive('heading', { level: 3 }) ? 'btn-active' : ''}`}
            title="Heading 3"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Heading3 className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`btn-toolbar ${editor?.isActive('bulletList') ? 'btn-active' : ''}`}
            title="Bullet List"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <List className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`btn-toolbar ${editor?.isActive('orderedList') ? 'btn-active' : ''}`}
            title="Numbered List"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <ListOrdered className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`btn-toolbar ${editor?.isActive('blockquote') ? 'btn-active' : ''}`}
            title="Quote"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <Quote className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => setTextAlignment('left')}
            className={`btn-toolbar ${editor?.isActive({ textAlign: 'left' }) ? 'btn-active' : ''}`}
            title="Align Left (Cmd+Shift+L)"
            disabled={!canSetTextAlignment('left')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <AlignLeft className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => setTextAlignment('center')}
            className={`btn-toolbar ${editor?.isActive({ textAlign: 'center' }) ? 'btn-active' : ''}`}
            title="Align Center (Cmd+Shift+E)"
            disabled={!canSetTextAlignment('center')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <AlignCenter className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => setTextAlignment('right')}
            className={`btn-toolbar ${editor?.isActive({ textAlign: 'right' }) ? 'btn-active' : ''}`}
            title="Align Right (Cmd+Shift+R)"
            disabled={!canSetTextAlignment('right')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <AlignRight className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={() => setTextAlignment('justify')}
            className={`btn-toolbar ${editor?.isActive({ textAlign: 'justify' }) ? 'btn-active' : ''}`}
            title="Justify (Cmd+Shift+J)"
            disabled={!canSetTextAlignment('justify')}
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <AlignJustify className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Insert Elements */}
        <div className="flex items-center gap-1">
          <button
            onClick={addTable}
            className="btn-toolbar"
            title="Insert Table"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <TableIcon className="w-4 h-4" />
            </div>
          </button>
          <button
            onClick={addImage}
            className="btn-toolbar"
            title="Insert Image"
          >
            <div className="btn-shadow"></div>
            <div className="btn-edge"></div>
            <div className="btn-front">
              <ImageIcon className="w-4 h-4" />
            </div>
          </button>
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
                <span className="text-xs font-medium">Col+</span>
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
                <span className="text-xs font-medium">Row+</span>
              </div>
            </button>
            <button
              onClick={() => editor?.chain().focus().deleteColumn().run()}
              className="btn-toolbar"
              title="Delete Column"
            >
              <div className="btn-shadow"></div>
              <div className="btn-edge"></div>
              <div className="btn-front text-red-600">
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
              <div className="btn-front text-red-600">
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
              <div className="btn-front text-red-600">
                <span className="text-xs font-medium">Del</span>
              </div>
            </button>
          </div>
        )}
      </motion.div>

      {/* Rich Text Editor */}
      <div className="flex-1 relative bg-white overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
          <EditorContent 
            editor={editor}
            className="prose prose-lg max-w-none focus:outline-none h-full"
            style={{
              minHeight: '100%',
            }}
          />
        </div>
        
        {/* Welcome Guide */}
        <AnimatePresence>
          {editor.getText().length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-8 left-8 right-8 max-w-4xl mx-auto pointer-events-none"
            >
              <div className="bg-blue-50/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/90 p-2 rounded-lg flex-shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Welcome to VibeDoc!</h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      Create professional documents with rich formatting, tables, and images. 
                      Need AI help? Just select any text and press <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono shadow-sm text-blue-800">⌘K</kbd> for instant suggestions.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-600" />
                        Smart editing
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>Rich formatting</span>
                      <span className="text-gray-300">•</span>
                      <span>AI assistance</span>
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


