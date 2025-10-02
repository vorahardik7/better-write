'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditorStore } from '@/lib/store/editor-store';
import { Sparkles, Zap, Type, Brain, Edit, Send, Loader2 } from 'lucide-react';

interface AICommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
}

const ACTIONS = [
  { label: 'Improve', prompt: 'improve this text to make it clearer and more professional', icon: Sparkles },
  { label: 'Shorter', prompt: 'make this text more concise', icon: Zap },
  { label: 'Longer', prompt: 'expand this text with more details', icon: Type },
  { label: 'Fix grammar', prompt: 'fix any grammar and spelling errors', icon: Brain },
  { label: 'Casual', prompt: 'make this text more casual and friendly', icon: Edit },
];

export function AICommandPalette({ isOpen, onClose, selectedText }: AICommandPaletteProps) {
  const { requestAISuggestion, isProcessing } = useEditorStore();
  const [customPrompt, setCustomPrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedSelection = useMemo(() => selectedText.trim(), [selectedText]);
  const hasSelection = trimmedSelection.length > 0;
  const truncatedSelection = useMemo(() => {
    if (!hasSelection) return '';
    return trimmedSelection.length > 190 ? `${trimmedSelection.slice(0, 190)}...` : trimmedSelection;
  }, [hasSelection, trimmedSelection]);

  const selectionMeta = useMemo(() => {
    if (!hasSelection) return null;
    const words = trimmedSelection.split(/\s+/).filter(Boolean).length;
    return {
      chars: trimmedSelection.length,
      words,
    };
  }, [hasSelection, trimmedSelection]);

  const handleAction = async (prompt: string) => {
    const instruction = prompt.trim();
    if (!hasSelection || !instruction) return;

    await requestAISuggestion(instruction);
    onClose();
  };

  const handleCustomSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const promptToSend = customPrompt.trim();
    if (!promptToSend) return;

    setCustomPrompt('');
    await handleAction(promptToSend);
  };

  useEffect(() => {
    if (!isOpen) {
      setCustomPrompt('');
      return;
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const buttonsDisabled = !hasSelection || isProcessing;

  return (
    <AnimatePresence>
      <motion.div
        key="ai-palette"
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.96 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="fixed top-28 left-1/2 z-50 w-[min(520px,calc(100vw-32px))] -translate-x-1/2"
      >
        <div className="bg-white rounded-xl border border-black/10 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#f5f4f0] border-b border-black/5">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">AI Assist</p>
              </div>
            </div>
            {isProcessing && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing
              </div>
            )}
          </div>

          <div className="px-4 py-4 space-y-4">
            <div className={`rounded-lg border ${hasSelection ? 'border-black/10 bg-white' : 'border-dashed border-black/20 bg-slate-50/80'} px-3 py-2.5 transition-colors`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected text</p>
                {selectionMeta && (
                  <span className="text-[11px] font-medium text-slate-500">{selectionMeta.words} words · {selectionMeta.chars} chars</span>
                )}
              </div>
              <p className={`mt-1 text-sm leading-relaxed ${hasSelection ? 'text-slate-800' : 'text-slate-400'}`}>
                {hasSelection ? truncatedSelection : 'Highlight some text in the editor to unlock AI actions.'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Quick actions</p>
                <span className="text-[11px] font-medium text-slate-400">Tap to run instantly</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACTIONS.map((action) => (
                  <motion.button
                    key={action.label}
                    onClick={() => handleAction(action.prompt)}
                    disabled={buttonsDisabled}
                    whileHover={{ scale: buttonsDisabled ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                      buttonsDisabled
                        ? 'border-black/10 bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'border-black/10 bg-white text-slate-700 hover:border-black/20 hover:bg-slate-50 cursor-pointer'
                    }`}
                    title={action.prompt}
                  >
                    <action.icon className="w-4 h-4 text-slate-500" />
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={customPrompt}
                  onChange={(event) => setCustomPrompt(event.target.value)}
                  placeholder={hasSelection ? 'Write a custom instruction...' : 'Select text to enable custom instructions'}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 disabled:bg-slate-100 disabled:text-slate-400"
                  disabled={buttonsDisabled}
                />
              </div>
              <motion.button
                type="submit"
                disabled={buttonsDisabled || customPrompt.trim().length === 0}
                whileHover={{ scale: buttonsDisabled || customPrompt.trim().length === 0 ? 1 : 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  buttonsDisabled || customPrompt.trim().length === 0
                    ? 'bg-slate-900/10 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-black cursor-pointer'
                }`}
              >
                <Send className="w-4 h-4" />
                Send
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>

      <motion.div
        key="ai-palette-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
        onClick={onClose}
      />
    </AnimatePresence>
  );
}