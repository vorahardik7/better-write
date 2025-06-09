'use client';

import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
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
import { Sparkles, Zap, Type, MousePointer, Bold, Italic, List, ListOrdered, Quote, Table as TableIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3 } from 'lucide-react';

export function RichTextEditor() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { 
    content, 
    setContent, 
    setSelection, 
    setEditorRef,
    selection 
  } = useEditorStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: false,
      }),
      TextStyle,
      FontFamily,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
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

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K to open AI command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (selection) {
        setShowCommandPalette(true);
      }
    }
    
    // Escape to close command palette
    if (e.key === 'Escape') {
      setShowCommandPalette(false);
    }
  }, [selection]);

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
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) {
    return <div className="h-full flex items-center justify-center">Loading editor...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Document Stats Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-8 py-3 bg-blue-50/80 backdrop-blur-sm border-b border-blue-100"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-md shadow-sm border border-blue-100">
            <Type className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Rich Document</span>
          </div>
          
          <motion.div
            className="text-xs text-blue-700 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>{editor.getText().length} characters</span>
            <span className="text-blue-400">•</span>
            <span>{editor.getText().split(/\s+/).filter(w => w.length > 0).length} words</span>
          </motion.div>
        </div>

        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 text-xs text-blue-700 bg-white px-3 py-1 rounded-md shadow-sm border border-blue-100"
            >
              <MousePointer className="w-3 h-3" />
              <span>Select text for AI assistance</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Formatting Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200 overflow-x-auto"
      >
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Underline"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Insert Elements */}
        <div className="flex items-center gap-1">
          <button
            onClick={addTable}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={addImage}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Rich Text Editor */}
      <div className="flex-1 relative bg-white overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <EditorContent 
            editor={editor}
            className="prose prose-lg max-w-none focus:outline-none"
            style={{
              minHeight: 'calc(100vh - 200px)',
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
              <div className="bg-blue-50 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Welcome to VibeDoc!</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      Create professional documents with rich formatting, tables, and images. 
                      Need AI help? Just select any text and press <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono shadow-sm text-blue-800">⌘K</kbd> for instant suggestions.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-600" />
                        Smart editing
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>Rich formatting</span>
                      <span className="text-slate-300">•</span>
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