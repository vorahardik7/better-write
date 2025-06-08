'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditorStore } from '@/lib/store/editor-store';
import { AICommandPalette } from './ai-command-palette';
import { AISuggestionOverlay } from './ai-suggestion-overlay';
import { Sparkles, Zap, Type, MousePointer } from 'lucide-react';

export function TextEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { 
    content, 
    setContent, 
    setSelection, 
    selection 
  } = useEditorStore();
  
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Track when user selects text
  const handleSelectionChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selectedText = content.slice(start, end);
      setSelection({
        start,
        end,
        text: selectedText,
      });
    } else {
      setSelection(null);
    }
  }, [content, setSelection]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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

  // Handle text changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Clean Editor Stats Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-8 py-3 bg-blue-50/80 backdrop-blur-sm border-b border-blue-100"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-md shadow-sm border border-blue-100">
            <Type className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Document</span>
          </div>
          
          <motion.div
            className="text-xs text-blue-700 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>{content.length} characters</span>
            <span className="text-blue-400">•</span>
            <span>{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
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

      {/* Clean Writing Area */}
      <div className="flex-1 relative bg-white">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onSelect={handleSelectionChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full h-full px-8 py-6 text-lg leading-relaxed border-none outline-none resize-none bg-transparent transition-colors duration-200 placeholder-blue-400 ${
            isFocused ? 'text-slate-800' : 'text-slate-700'
          }`}
          placeholder="Start writing your document..."
          spellCheck={false}
          style={{ 
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        />
        
        {/* Welcome Guide - Clean blue */}
        <AnimatePresence>
          {content.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-8 left-8 right-8 pointer-events-none"
            >
              <div className="bg-blue-50 backdrop-blur-sm rounded-xl p-6 max-w-2xl shadow-sm border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Welcome to VibeDoc!</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      Start typing to begin your document. Need AI help? Just select any text and press <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono shadow-sm text-blue-800">⌘K</kbd> to get instant suggestions.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-600" />
                        Smart editing
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>Grammar fixes</span>
                      <span className="text-slate-300">•</span>
                      <span>Style improvements</span>
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