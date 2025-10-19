'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/35 flex items-center justify-center z-[60]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#fffdf3] rounded-2xl p-6 w-full max-w-md mx-4 shadow-[0_28px_60px_rgba(136,153,79,0.22)] border border-[rgba(136,153,79,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[rgb(72,84,42)]">Keyboard Shortcuts</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-[rgba(136,153,79,0.14)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[rgba(96,108,58,0.75)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[rgb(96,108,58)] mb-2">Text Formatting</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Bold</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+B</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Italic</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+I</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Underline</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+U</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Link</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+K</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[rgb(96,108,58)] mb-2">Edit Operations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Undo</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+Z</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Redo</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+Y</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[rgb(96,108,58)] mb-2">AI Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">AI Help</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">⌘K</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[rgb(96,108,58)] mb-2">Text Alignment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Align Left</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+Shift+L</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Align Center</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+Shift+E</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Align Right</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+Shift+R</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgba(96,108,58,0.85)]">Justify</span>
                    <kbd className="px-2 py-1 bg-[#fbf5e6] border border-[rgba(136,153,79,0.3)] rounded text-xs font-semibold shadow-sm text-[rgb(72,84,42)]">Ctrl+Shift+J</kbd>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
