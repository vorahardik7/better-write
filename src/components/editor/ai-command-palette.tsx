'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditorStore } from '@/lib/store/editor-store';
import { X, Sparkles, Zap, Edit, Type, FileText, Brain, Table, List, Code } from 'lucide-react';

interface AICommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
}

const TEXT_PROMPTS = [
  { 
    label: 'Make formal', 
    prompt: 'make this text more formal and professional',
    icon: FileText,
  },
  { 
    label: 'Make casual', 
    prompt: 'make this text more casual and friendly',
    icon: Edit,
  },
  { 
    label: 'Shorter', 
    prompt: 'make this text more concise',
    icon: Zap,
  },
  { 
    label: 'Longer', 
    prompt: 'expand this text with more details',
    icon: Type,
  },
  { 
    label: 'Fix grammar', 
    prompt: 'fix any grammar and spelling errors',
    icon: Brain,
  },
  { 
    label: 'Summarize', 
    prompt: 'create a brief summary of this text',
    icon: FileText,
  },
];

const CONTENT_PROMPTS = [
  { 
    label: 'Create table', 
    prompt: 'create a relevant table based on this text with appropriate columns and sample data',
    icon: Table,
  },
  { 
    label: 'Make list', 
    prompt: 'convert this text into a well-organized bullet point list',
    icon: List,
  },
  { 
    label: 'Add examples', 
    prompt: 'add relevant examples and code snippets to illustrate this text',
    icon: Code,
  },
  { 
    label: 'Make outline', 
    prompt: 'create a detailed outline or structure from this text',
    icon: FileText,
  },
];

export function AICommandPalette({ isOpen, onClose, selectedText }: AICommandPaletteProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const { requestAISuggestion, isProcessing } = useEditorStore();

  if (!isOpen) return null;

  const handleQuickPrompt = async (prompt: string) => {
    await requestAISuggestion(prompt);
    onClose();
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    await requestAISuggestion(customPrompt);
    setCustomPrompt('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomPrompt();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">AI Assistant</h3>
                <p className="text-xs text-gray-700">Transform your text</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-toolbar"
            >
              <div className="btn-shadow"></div>
              <div className="btn-edge"></div>
              <div className="btn-front">
                <X className="w-4 h-4 text-gray-500" />
              </div>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Selected text preview */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start gap-2">
                <Type className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-800 block mb-1">Selected Text</span>
                  <p className="text-sm text-gray-800 truncate">
                    &quot;{selectedText.slice(0, 80)}{selectedText.length > 80 ? '...' : ''}&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Text Editing */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Text Editing</h4>
              <div className="grid grid-cols-2 gap-2">
                {TEXT_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickPrompt(item.prompt)}
                    disabled={isProcessing}
                    className="btn-toolbar w-full text-left disabled:opacity-50"
                  >
                    <div className="btn-shadow"></div>
                    <div className="btn-edge"></div>
                    <div className="btn-front flex items-center gap-2 p-2.5">
                      <item.icon className="w-4 h-4 text-gray-700 flex-shrink-0" />
                      <span className="text-gray-800 truncate">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Generation */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Content Generation</h4>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickPrompt(item.prompt)}
                    disabled={isProcessing}
                    className="btn-toolbar w-full text-left disabled:opacity-50"
                  >
                    <div className="btn-shadow"></div>
                    <div className="btn-edge"></div>
                    <div className="btn-front flex items-center gap-2 p-2.5">
                      <item.icon className="w-4 h-4 text-gray-700 flex-shrink-0" />
                      <span className="text-gray-800 truncate">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom instruction */}
            <div className="space-y-4">
              <label className="font-semibold text-gray-900 text-sm mb-3">Custom Instructions</label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you want..."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                autoFocus
                disabled={isProcessing}
              />
              
              <button
                onClick={handleCustomPrompt}
                disabled={!customPrompt.trim() || isProcessing}
                className="btn-3d btn-primary btn-small w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="btn-shadow"></div>
                <div className="btn-edge"></div>
                <div className="btn-front flex items-center justify-center gap-2 py-2.5">
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Apply AI
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 