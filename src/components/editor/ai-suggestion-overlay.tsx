'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEditorStore } from '@/lib/store/editor-store';
import { Check, X, Sparkles, Brain, Zap, RefreshCw, Table, List, Code } from 'lucide-react';

// Helper function to create a clean preview of AI suggestions
function createSuggestionPreview(content: string): { preview: string; type: 'table' | 'list' | 'code' | 'text'; icon: React.ComponentType<{ className?: string }> } {
  const cleanContent = content.trim();
  
  // Table detection
  if (cleanContent.includes('<table') || (cleanContent.includes('|') && cleanContent.includes('---'))) {
    const tablePreview = cleanContent.includes('<table') 
      ? "📊 Table with data and columns"
      : "📊 Table created from your content";
    return { preview: tablePreview, type: 'table', icon: Table };
  }
  
  // List detection
  if (cleanContent.includes('<ul>') || cleanContent.includes('<ol>') || cleanContent.includes('- ') || cleanContent.match(/^\d+\./m)) {
    const listType = cleanContent.includes('<ol>') || cleanContent.match(/^\d+\./m) ? 'numbered' : 'bullet';
    let itemCount = 0;
    
    if (cleanContent.includes('<li>')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanContent, 'text/html');
      itemCount = doc.querySelectorAll('li').length;
    } else {
      const lines = cleanContent.split('\n');
      itemCount = lines.filter(line => line.trim().match(/^[-*]\s/) || line.trim().match(/^\d+\./)).length;
    }
    
    const listPreview = `📝 ${itemCount} ${listType} list items`;
    return { preview: listPreview, type: 'list', icon: List };
  }
  
  // Code detection
  if (cleanContent.includes('<pre>') || cleanContent.includes('<code>') || cleanContent.includes('```')) {
    let language = '';
    if (cleanContent.includes('```')) {
      const match = cleanContent.match(/```(\w+)/);
      language = match ? ` (${match[1]})` : '';
    }
    const codePreview = `💻 Code block${language}`;
    return { preview: codePreview, type: 'code', icon: Code };
  }
  
  // Regular text - clean HTML and show preview
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanContent, 'text/html');
  const plainText = doc.body.textContent || cleanContent;
  
  // Truncate long text
  const preview = plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  return { preview, type: 'text', icon: Sparkles };
}

export function AISuggestionOverlay() {
  const { aiSuggestion, acceptSuggestion, rejectSuggestion, isProcessing } = useEditorStore();

  // Get clean preview for the suggestion
  const suggestionPreview = aiSuggestion ? createSuggestionPreview(aiSuggestion.suggestedText) : null;

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[6px_6px_0_#000] max-w-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 border-2 border-black p-2 rounded-lg shadow-[3px_3px_0_#000]">
              <Brain className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-black rounded-full"
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.08,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-900">Thinking…</span>
              </div>
              <p className="text-[11px] text-gray-700 mt-1">Preparing a refined suggestion</p>
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
        className="fixed bottom-8 left-8 z-50 w-[min(32rem,90vw)]"
      >
        <div className="bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_#000] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 border border-blue-100 p-1.5 rounded-lg shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">AI Suggestion</h3>
                {aiSuggestion.reasoning && (
                  <p className="text-xs text-gray-600">
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
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Original</span>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-gray-800 line-through">
                    {aiSuggestion.originalText}
                  </p>
                </div>
              </div>

              {/* Suggested text */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Suggested</span>
                  {suggestionPreview && suggestionPreview.type !== 'text' && (
                    <div className="flex items-center gap-1 ml-2">
                      <suggestionPreview.icon className="w-3 h-3 text-gray-700" />
                      <span className="text-xs text-gray-700 capitalize">{suggestionPreview.type}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-emerald-50 border-2 border-black rounded-lg max-h-60 overflow-auto">
                  <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                    {aiSuggestion.suggestedText}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={acceptSuggestion}
                className="flex-1 font-semibold bg-emerald-100 text-black border-2 border-black rounded-lg shadow-[3px_3px_0_#000] px-3 py-2.5 hover:shadow-[4px_4px_0_#000] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Accept</span>
                </div>
              </button>

              <button
                onClick={rejectSuggestion}
                className="flex-1 font-semibold bg-red-100 text-black border-2 border-black rounded-lg shadow-[3px_3px_0_#000] px-3 py-2.5 hover:shadow-[4px_4px_0_#000] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </div>
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-3 text-xs text-gray-600 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                <span>
                  {suggestionPreview?.type === 'text' 
                    ? `${aiSuggestion.originalText.length} → ${aiSuggestion.suggestedText.length} chars`
                    : `Text → ${suggestionPreview?.type || 'Enhanced content'}`
                  }
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