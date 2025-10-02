'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEditorStore } from '@/lib/store/editor-store';
import { Check, X, Sparkles, Table, List, Code, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

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

  const showOverlay = isProcessing || Boolean(aiSuggestion);
  if (!showOverlay) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ai-overlay"
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="fixed top-28 left-1/2 z-40 w-[min(520px,calc(100vw-32px))] -translate-x-1/2"
      >
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-[#f5f4f0] px-4 py-3">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {isProcessing ? 'Generating suggestion' : 'AI Suggestion ready'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking
                </>
              ) : (
                <span>
                  {aiSuggestion?.originalText.length ?? 0} → {aiSuggestion?.suggestedText.length ?? 0} chars
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-black/15 bg-slate-50/80 px-6 py-5 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-10 w-10 rounded-full border-2 border-slate-300 border-t-slate-700"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Rewriting your selection</p>
                  <p className="mt-1 text-xs text-slate-500">
                    We are keeping the meaning intact while improving tone, clarity, and consistency.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-black/10 bg-[#f5f4f0] px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">What changed</p>
                  <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                      <p className="text-xs font-semibold text-slate-500">Original</p>
                      <p className="mt-1 line-clamp-4 text-xs text-slate-500">
                        {aiSuggestion?.originalText || ''}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-emerald-200/60">
                      <p className="text-xs font-semibold text-emerald-600">Suggested</p>
                      <p className="mt-1 text-sm font-medium text-slate-900 whitespace-pre-wrap">
                        {aiSuggestion?.suggestedText || ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <motion.button
                    onClick={acceptSuggestion}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black"
                  >
                    <Check className="h-4 w-4" />
                    Accept suggestion
                  </motion.button>
                  <motion.button
                    onClick={rejectSuggestion}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-black/20 hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                    Try again
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}