'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Eye, FileText, Loader2, Star, Trash2, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import Link from 'next/link';
import { Document } from '@/lib/store/document-store';
import { DocumentPreviewModal } from '@/components/document-preview-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import React from 'react';

interface DocumentsViewProps {
  loading: boolean;
  error?: string | null;
  viewMode: 'grid' | 'list';
  filteredDocuments: Document[];
  sortedDocuments: Document[];
  starredIds: string[];
  sortKey: 'title' | 'wordCount' | 'updatedAt' | 'createdAt' | 'isPublic';
  sortDir: 'asc' | 'desc';
  onSort: (key: 'title' | 'wordCount' | 'updatedAt' | 'createdAt' | 'isPublic') => void;
  onOpenDocument: (id: string) => void;
  onPreview: (doc: Document, e: React.MouseEvent) => void;
  onStar: (doc: Document, e: React.MouseEvent) => void;
  onDeleteClick: (doc: Document, e: React.MouseEvent) => void;
  previewDocument: Document | null;
  deleteConfirmDoc: Document | null;
  onClosePreview: () => void;
  onConfirmDelete: () => Promise<void> | void;
  formatDate: (dateString: string) => string;
  formatDateTime: (dateString: string) => string;
  onRetry?: () => void;
}

export function DocumentsView({
  loading,
  error,
  viewMode,
  filteredDocuments,
  sortedDocuments,
  starredIds,
  sortKey,
  sortDir,
  onSort,
  onOpenDocument,
  onPreview,
  onStar,
  onDeleteClick,
  previewDocument,
  deleteConfirmDoc,
  onClosePreview,
  onConfirmDelete,
  formatDate,
  formatDateTime,
  onRetry,
}: DocumentsViewProps) {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-[#fdf9f3] via-[#f8f4e6] to-[#f0ead9]">
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[rgba(197,161,113,0.8)] animate-spin" />
          </div>
        ) : filteredDocuments.length > 0 ? (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1], layout: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
            layout
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3 w-full'}
          >
            {viewMode === 'grid' && filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1], layout: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                whileHover={{ y: -2, scale: 1.01, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                className={`group relative rounded-xl border border-[rgba(214,184,140,0.28)] bg-[#fffbf3] shadow-[0_12px_28px_rgba(214,184,140,0.15)] hover:shadow-[0_16px_32px_rgba(197,161,113,0.2)] hover:border-[rgba(197,161,113,0.42)] transition-all duration-200 cursor-pointer p-4`}
                role="button"
                tabIndex={0}
                onClick={() => onOpenDocument(doc.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenDocument(doc.id);
                  }
                }}
              >
                <>
                  <div className="aspect-[3/2] rounded-lg mb-3 flex items-center justify-center bg-[#f9eedc] border border-[rgba(214,184,140,0.32)]">
                    <FileText className="w-5 h-5 text-[rgb(176,142,99)]" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="font-semibold text-[rgb(63,54,38)] group-hover:text-[rgb(176,142,99)] transition-colors line-clamp-1 text-sm flex-1">
                          {doc.title}
                        </h3>
                        <button onClick={(e) => onStar(doc, e)} className="flex-shrink-0 p-1 hover:bg-[#f8eddc] rounded transition-colors" title={starredIds.includes(doc.id) ? 'Unstar document' : 'Star document'}>
                          <Star className={`w-3 h-3 ${doc.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-[rgb(87,73,55)]'}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[rgba(128,108,82,0.8)] line-clamp-1">{(doc.contentText ?? '').slice(0, 60)}...</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#f8eddc] text-[rgb(176,142,99)] border border-[rgba(197,161,113,0.35)]">
                          {doc.isPublic ? 'Public' : 'Private'}
                        </span>
                        <span className="text-xs text-[rgba(128,108,82,0.65)]">{doc.wordCount.toLocaleString()}w</span>
                      </div>
                      <span className="text-xs text-[rgba(128,108,82,0.55)]">{formatDate(doc.lastEditedAt)}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-0.5 bg-[#fff7ed] rounded-md p-0.5 shadow-sm border border-[rgba(214,184,140,0.32)]">
                      <button onClick={(e) => onPreview(doc, e)} className="p-1 hover:bg-[#f8eddc] rounded transition-colors" title="Preview">
                        <Eye className="w-3 h-3 text-[rgb(87,73,55)]" />
                      </button>
                      <button onClick={(e) => onDeleteClick(doc, e)} className="p-1 hover:bg-red-100 rounded transition-colors" title="Delete document">
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                </>
              </motion.div>
            ))}

            {viewMode === 'list' && (
              <div className="w-full bg-[#fffbf3] border border-[rgba(214,184,140,0.28)] rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-2 bg-[#f8f0df] text-[rgb(90,78,60)] text-xs font-semibold border-b border-[rgba(214,184,140,0.28)]">
                  <button onClick={() => onSort('title')} className="col-span-4 text-left flex items-center gap-1">Title {sortKey==='title' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                  <button onClick={() => onSort('wordCount')} className="col-span-2 text-left flex items-center gap-1">Words {sortKey==='wordCount' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                  <button onClick={() => onSort('updatedAt')} className="col-span-2 text-left flex items-center gap-1">Updated {sortKey==='updatedAt' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                  <button onClick={() => onSort('createdAt')} className="col-span-2 text-left flex items-center gap-1">Created {sortKey==='createdAt' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                  <button onClick={() => onSort('isPublic')} className="col-span-1 text-left flex items-center gap-1">Visibility {sortKey==='isPublic' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                <div>
                  {sortedDocuments.map((doc) => (
                    <div key={doc.id} className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0 border-[rgba(214,184,140,0.2)] hover:bg-[#fffaf1] transition-colors cursor-pointer" onClick={() => onOpenDocument(doc.id)}>
                      <div className="col-span-4 truncate font-medium text-[rgb(63,54,38)]">{doc.title}</div>
                      <div className="col-span-2 text-[rgba(128,108,82,0.8)]">{doc.wordCount.toLocaleString()}</div>
                      <div className="col-span-2 text-[rgba(128,108,82,0.8)]">{formatDateTime(doc.updatedAt)}</div>
                      <div className="col-span-2 text-[rgba(128,108,82,0.8)]">{formatDateTime(doc.createdAt)}</div>
                      <div className="col-span-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#f8eddc] text-[rgb(176,142,99)] border border-[rgba(197,161,113,0.35)]">{doc.isPublic ? 'Public' : 'Private'}</span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-2">
                        <button onClick={(e) => onStar(doc, e)} className="p-1 hover:bg-[#f8eddc] rounded transition-colors" title={doc.isStarred ? 'Unstar document' : 'Star document'}>
                          <Star className={`w-4 h-4 ${doc.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-[rgb(87,73,55)]'}`} />
                        </button>
                        <button onClick={(e) => onPreview(doc, e)} className="p-1 hover:bg-[#f8eddc] rounded transition-colors" title="Preview">
                          <Eye className="w-4 h-4 text-[rgb(87,73,55)]" />
                        </button>
                        <button onClick={(e) => onDeleteClick(doc, e)} className="p-1 hover:bg-red-100 rounded transition-colors" title="Delete document">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-[#fff9ef] border border-[rgba(214,184,140,0.32)] rounded-full flex items-center justify-center mb-4 shadow-[0_14px_40px_rgba(197,161,113,0.2)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3H14V5H10V3ZM4 21H20V19H4V21ZM4 17H20V15H4V17ZM4 13H20V11H4V13ZM4 9H20V7H4V9Z" fill="currentColor"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-[rgb(63,54,38)] mb-2">No documents found</h3>
            {error && onRetry && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-red-600">{error}</span>
                <button onClick={onRetry} className="text-sm text-blue-600 hover:text-blue-800 underline">Retry</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        starredIds={starredIds}
        onClose={onClosePreview}
        onStar={onStar}
        onOpenDocument={onOpenDocument}
        onDeleteClick={onDeleteClick}
        formatDate={formatDate}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        document={deleteConfirmDoc}
        onClose={onClosePreview}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}


