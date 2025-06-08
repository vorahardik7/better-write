'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEditorStore } from '@/lib/store/editor-store';
import { Check, X, Sparkles, Brain, Zap, RefreshCw } from 'lucide-react';

export function AISuggestionOverlay() {
  const { aiSuggestion, acceptSuggestion, rejectSuggestion, isProcessing } = useEditorStore();

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg max-w-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">AI is thinking...</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Processing your request</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!aiSuggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-8 left-8 z-50 max-w-md"
      >
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">AI Suggestion</h3>
                {aiSuggestion.reasoning && (
                  <p className="text-xs text-gray-500">
                    {aiSuggestion.reasoning}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Text Comparison */}
            <div className="space-y-3">
              {/* Original text */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <X className="w-3 h-3 text-red-500" />
                  <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Original</span>
                </div>
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 line-through">
                    {aiSuggestion.originalText}
                  </p>
                </div>
              </div>

              {/* Suggested text */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Suggested</span>
                </div>
                <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    {aiSuggestion.suggestedText}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={acceptSuggestion}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Accept</span>
              </button>
              
              <button
                onClick={rejectSuggestion}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                <span>
                  {aiSuggestion.originalText.length} → {aiSuggestion.suggestedText.length} chars
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>AI Enhanced</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 