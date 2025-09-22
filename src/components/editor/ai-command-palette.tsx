'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditorStore } from '@/lib/store/editor-store';
import { X, Sparkles, Zap, Edit, Type, FileText, Brain, Table, List, Code, Lock } from 'lucide-react';

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
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const { requestAISuggestion, isProcessing } = useEditorStore();
  const hasSelection = selectedText.trim().length > 0;

  const handleToggleAction = (label: string) => {
    setSelectedActions((prev) => {
      if (prev.includes(label)) return prev.filter((l) => l !== label);
      return [...prev, label];
    });
  };

  const combinedPrompt = useMemo(() => {
    const picked = TEXT_PROMPTS
      .filter((p) => selectedActions.includes(p.label))
      .map((p) => p.prompt);
    const parts = [...picked];
    if (customPrompt.trim()) parts.push(customPrompt.trim());
    return parts.join('. ');
  }, [selectedActions, customPrompt]);

  const handleApply = async () => {
    if (!combinedPrompt || !hasSelection) return;
    await requestAISuggestion(combinedPrompt);
    setCustomPrompt('');
    setSelectedActions([]);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleApply();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200 cursor-default"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-palette-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-neutral-50">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-lg border border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <h3 id="ai-palette-title" className="font-bold text-gray-900">AI Assistant</h3>
                <p className="text-xs text-gray-700">Transform your text</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-200 rounded-md">
                <Lock className="w-3 h-3 text-gray-700" />
                <span className="text-[11px] font-medium text-gray-700">Demo Mode</span>
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
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Selected text preview */}
            <div className="p-3 bg-gray-50 rounded-lg border-2 border-black shadow-[3px_3px_0_#000]">
              <div className="flex items-start gap-2">
                <Type className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-800 block mb-1">Selected Text</span>
                  {hasSelection ? (
                    <p className="text-sm text-gray-800 truncate">
                      &quot;{selectedText.slice(0, 80)}{selectedText.length > 80 ? '...' : ''}&quot;
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">No text selected. Select text in the editor to enable editing actions.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Text Editing */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Text Editing</h4>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                {TEXT_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleToggleAction(item.label)}
                    disabled={!hasSelection || isProcessing}
                    className={`btn-toolbar w-full text-left cursor-pointer ${selectedActions.includes(item.label) ? 'btn-active' : ''} ${(!hasSelection || isProcessing) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="btn-shadow"></div>
                    <div className="btn-edge"></div>
                    <div className="btn-front flex items-center gap-2 p-3">
                      <item.icon className="w-4 h-4 text-gray-700 flex-shrink-0" />
                      <span className="text-sm text-gray-800 truncate">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {selectedActions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedActions.map((label) => (
                    <span key={label} className="px-2 py-0.5 text-[11px] bg-blue-50 border border-blue-200 text-blue-800 rounded">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content Generation */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Content Generation</h4>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                {CONTENT_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {}}
                    disabled
                    className="btn-toolbar w-full text-left opacity-60 cursor-not-allowed"
                  >
                    <div className="btn-shadow"></div>
                    <div className="btn-edge"></div>
                    <div className="btn-front flex items-center gap-2 p-3">
                      <item.icon className="w-4 h-4 text-gray-700 flex-shrink-0" />
                      <span className="text-sm text-gray-800 truncate">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-gray-600">
                Content generation is locked in the demo. Text editing is available.
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
                placeholder={hasSelection ? 'Describe what you want...' : 'Select text first to enable Apply'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                autoFocus
                disabled={!hasSelection || isProcessing}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleApply}
                  disabled={!hasSelection || (!customPrompt.trim() && selectedActions.length === 0) || isProcessing}
                  className={`inline-flex items-center justify-center gap-1 h-9 px-4 rounded-lg border-2 border-black bg-emerald-100 text-black font-semibold shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] transition-all ${(!hasSelection || (!customPrompt.trim() && selectedActions.length === 0) || isProcessing) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Zap className="w-3 h-3" />
                  <span className="text-sm">Apply</span>
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1 h-9 px-4 rounded-lg border-2 border-black bg-white text-black font-semibold shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span className="text-sm">Close</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 