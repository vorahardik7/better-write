'use client';

import { motion, AnimatePresence } from 'motion/react';
import { FileText, Star, X, Trash2 } from 'lucide-react';
import { Document } from '@/lib/store/document-store';

interface DocumentPreviewModalProps {
  document: Document | null;
  starredIds: string[];
  onClose: () => void;
  onStar: (doc: Document, e: React.MouseEvent) => void;
  onOpenDocument: (id: string) => void;
  onDeleteClick: (doc: Document, e: React.MouseEvent) => void;
  formatDate: (dateString: string) => string;
}

export function DocumentPreviewModal({
  document,
  starredIds,
  onClose,
  onStar,
  onOpenDocument,
  onDeleteClick,
  formatDate,
}: DocumentPreviewModalProps) {
  if (!document) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[rgb(176,142,99)]" />
              <h2 className="text-xl font-semibold text-[rgb(63,54,38)]">
                {document.title}
              </h2>
              <button
                onClick={(e) => onStar(document, e)}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                title={starredIds.includes(document.id) ? "Unstar document" : "Star document"}
              >
                <Star 
                  className={`w-5 h-5 ${
                    starredIds.includes(document.id) || document.isStarred 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-400'
                  }`} 
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenDocument(document.id)}
                className="px-4 py-2 bg-[rgb(136,153,79)] hover:bg-[rgb(118,132,68)] text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                Open Document
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {document.contentText || 'No content available'}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{document.wordCount.toLocaleString()} words</span>
              <span>•</span>
              <span>{document.characterCount.toLocaleString()} characters</span>
              <span>•</span>
              <span>Last edited {formatDate(document.lastEditedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => onDeleteClick(document, e)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
