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
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="fixed top-28 left-1/2 z-50 w-[min(520px,calc(100vw-32px))] -translate-x-1/2"
      >
        <div className="rounded-2xl border border-[rgba(136,153,79,0.25)] bg-[#fffdf3] shadow-[0_28px_60px_rgba(136,153,79,0.22)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#f7f3e5] border-b border-[rgba(136,153,79,0.18)]">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-semibold text-[rgb(72,84,42)]">AI Assist</p>
              </div>
            </div>
            {isProcessing && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[rgba(96,108,58,0.75)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing
              </div>
            )}
          </div>

          <div className="px-4 py-4 space-y-4">
            <div
              className={`rounded-xl px-3 py-2.5 transition-colors border ${
                hasSelection
                  ? 'border-[rgba(136,153,79,0.25)] bg-white'
                  : 'border-dashed border-[rgba(136,153,79,0.35)] bg-[#fbf5e6]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(96,108,58,0.75)]">Selected text</p>
                {selectionMeta && (
                  <span className="text-[11px] font-medium text-[rgba(96,108,58,0.65)]">
                    {selectionMeta.words} words · {selectionMeta.chars} chars
                  </span>
                )}
              </div>
              <p
                className={`mt-1 text-sm leading-relaxed ${
                  hasSelection ? 'text-[rgb(72,84,42)]' : 'text-[rgba(96,108,58,0.55)]'
                }`}
              >
                {hasSelection
                  ? truncatedSelection
                  : 'Highlight some text in the editor to unlock AI actions.'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[rgba(96,108,58,0.8)] uppercase tracking-[0.2em]">
                  Quick actions
                </p>
                <span className="text-[11px] font-medium text-[rgba(136,153,79,0.7)]">
                  Tap to run instantly
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACTIONS.map((action) => (
                  <motion.button
                    key={action.label}
                    onClick={() => handleAction(action.prompt)}
                    disabled={buttonsDisabled}
                    whileHover={{ scale: buttonsDisabled ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                      buttonsDisabled
                        ? 'border-[rgba(136,153,79,0.22)] bg-[#f3efe0] text-[rgba(96,108,58,0.45)] cursor-not-allowed'
                        : 'border-[rgba(136,153,79,0.22)] bg-white text-[rgb(87,73,55)] hover:border-[rgba(136,153,79,0.35)] hover:bg-[#fefae2] cursor-pointer shadow-[0_10px_22px_rgba(136,153,79,0.14)]'
                    }`}
                    title={action.prompt}
                  >
                    <action.icon
                      className={`w-4 h-4 ${
                        buttonsDisabled
                          ? 'text-[rgba(136,153,79,0.45)]'
                          : 'text-[rgb(136,153,79)]'
                      }`}
                    />
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleCustomSubmit}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={customPrompt}
                  onChange={(event) => setCustomPrompt(event.target.value)}
                  placeholder={
                    hasSelection
                      ? 'Write a custom instruction...'
                      : 'Select text to enable custom instructions'
                  }
                  className="w-full rounded-xl border border-[rgba(136,153,79,0.25)] bg-white px-3 py-2 text-sm text-[rgb(72,84,42)] shadow-sm placeholder:text-[rgba(136,153,79,0.6)] focus:border-[rgba(136,153,79,0.45)] focus:outline-none focus:ring-2 focus:ring-[rgba(136,153,79,0.32)] disabled:bg-[#f3efe0] disabled:text-[rgba(96,108,58,0.45)]"
                  disabled={buttonsDisabled}
                />
              </div>
              <motion.button
                type="submit"
                disabled={buttonsDisabled || customPrompt.trim().length === 0}
                whileHover={{
                  scale: buttonsDisabled || customPrompt.trim().length === 0 ? 1 : 1.03,
                }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-[0_12px_26px_rgba(136,153,79,0.2)] ${
                  buttonsDisabled || customPrompt.trim().length === 0
                    ? 'bg-[#f3efe0] text-[rgba(96,108,58,0.45)] cursor-not-allowed'
                    : 'bg-[rgb(136,153,79)] text-white hover:bg-[rgb(118,132,68)] cursor-pointer'
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
        className="fixed inset-0 z-40 bg-black/12 backdrop-blur-[2px]"
        onClick={onClose}
      />
    </AnimatePresence>
  );
}