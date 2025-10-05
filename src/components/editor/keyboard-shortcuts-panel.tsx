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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Keyboard Shortcuts</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Text Formatting</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Bold</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+B</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Italic</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+I</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Underline</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+U</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Link</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+K</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-800 mb-2">Edit Operations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Undo</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+Z</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Redo</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+Y</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-800 mb-2">AI Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">AI Help</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">⌘K</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-800 mb-2">Text Alignment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Align Left</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+Shift+L</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Align Center</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+Shift+E</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Align Right</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+Shift+R</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Justify</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold shadow-sm">Ctrl+Shift+J</kbd>
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
