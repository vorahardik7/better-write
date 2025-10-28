'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Eye,
  FileText,
  Loader2,
  RefreshCcw,
  Star,
  Trash2,
  ArrowBigUp,
  ArrowBigDown,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useDocumentStore, type Document } from '@/lib/store/document-store';
import { DocumentPreviewModal } from '@/components/document-preview-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

interface MainContentProps {
  initialDocuments?: Document[];
  activeItem: string;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filters: {
    starredOnly: boolean;
    sharedOnly: boolean;
  };
  onDocumentCountsChange?: (counts: {
    all: number;
    starred: number;
    recent: number;
    shared: number;
    archive: number;
  }) => void;
}


export function MainContent({
  initialDocuments = [],
  activeItem,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  filters,
  onDocumentCountsChange,
}: MainContentProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Use document store instead of local state
  const {
    documents,
    loading,
    error,
    fetchDocuments,
    getDocumentCounts,
    clearCache,
  } = useDocumentStore();

  // Derive starred IDs from store to keep sidebar counts in sync
  const starredIds = useMemo(() => {
    return documents.filter((d) => d.isStarred === true).map((d) => d.id);
  }, [documents]);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<Document | null>(null);

  // Fetch documents on component mount
  useEffect(() => {
    if (!session?.user) {
      return;
    }

    // If we have initial documents, set them in the store
    if (initialDocuments.length > 0) {
      useDocumentStore.getState().setDocuments(initialDocuments);
    } else {
      // Fetch documents from API
      fetchDocuments();
    }
  }, [session?.user, initialDocuments.length, fetchDocuments]);

  // Get document counts from store
  const documentCounts = useMemo(() => {
    return getDocumentCounts();
  }, [documents, getDocumentCounts]);

  // Notify parent of document counts
  useEffect(() => {
    if (!onDocumentCountsChange) return;
    onDocumentCountsChange(documentCounts);
  }, [documentCounts, onDocumentCountsChange]);

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        if (activeItem !== 'archive' && doc.isArchived) {
          return false;
        }

        if (filters.starredOnly && !doc.isStarred) {
          return false;
        }

        if (filters.sharedOnly && !doc.isPublic) {
          return false;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(lowerQuery);
        const matchesContent = doc.contentText?.toLowerCase().includes(lowerQuery) ?? false;

        return matchesTitle || matchesContent;
      });
  }, [activeItem, documents, filters.sharedOnly, filters.starredOnly, searchQuery, starredIds]);

  // Sorting for list view
  const [sortKey, setSortKey] = useState<'title' | 'wordCount' | 'updatedAt' | 'createdAt' | 'isPublic'>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Load persisted sorting preferences
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('documents_sort_key');
      const savedDir = localStorage.getItem('documents_sort_dir');
      if (savedKey === 'title' || savedKey === 'wordCount' || savedKey === 'updatedAt' || savedKey === 'createdAt' || savedKey === 'isPublic') {
        setSortKey(savedKey);
      }
      if (savedDir === 'asc' || savedDir === 'desc') {
        setSortDir(savedDir);
      }
    } catch {}
  }, []);

  // Persist sorting preferences
  useEffect(() => {
    try {
      localStorage.setItem('documents_sort_key', sortKey);
      localStorage.setItem('documents_sort_dir', sortDir);
    } catch {}
  }, [sortKey, sortDir]);

  const sortedDocuments = useMemo(() => {
    if (!filteredDocuments.length) return filteredDocuments;
    const docs = [...filteredDocuments];
    docs.sort((a, b) => {
      let av: any;
      let bv: any;
      switch (sortKey) {
        case 'title':
          av = a.title.toLowerCase();
          bv = b.title.toLowerCase();
          break;
        case 'wordCount':
          av = a.wordCount;
          bv = b.wordCount;
          break;
        case 'createdAt':
          av = new Date(a.createdAt).getTime();
          bv = new Date(b.createdAt).getTime();
          break;
        case 'isPublic':
          av = a.isPublic ? 1 : 0;
          bv = b.isPublic ? 1 : 0;
          break;
        case 'updatedAt':
        default:
          av = new Date(a.updatedAt).getTime();
          bv = new Date(b.updatedAt).getTime();
          break;
      }
      if (av === bv) return 0;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return docs;
  }, [filteredDocuments, sortKey, sortDir]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleOpenDocument = (id: string) => {
    router.push(`/editor?id=${id}`);
  };

  const handleRefresh = () => {
    clearCache();
    fetchDocuments(true); // Force refresh
  };

  const handlePreview = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewDocument(doc);
  };

  const handleStar = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    // Update the document in the store so counts reflect immediately
    useDocumentStore.getState().updateDocument(doc.id, { isStarred: !doc.isStarred });
  };

  const handleDeleteClick = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmDoc(doc);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmDoc) return;
    
    try {
      const response = await fetch(`/api/documents/${deleteConfirmDoc.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from store
        useDocumentStore.getState().removeDocument(deleteConfirmDoc.id);
        setDeleteConfirmDoc(null);
      } else {
        console.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isSameDay = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);

    if (isSameDay) return `Today • ${time}`;
    if (isYesterday) return `Yesterday • ${time}`;

    const day = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);

    return `${day} • ${time}`;
  };

  return (
    <>
      {/* Header - Clean and minimal */}
      <header className="bg-transparent p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(52,63,29)]">Documents</h1>
            {error && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-red-600">{error}</span>
                <button
                  onClick={handleRefresh}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(136,153,79,0.6)]" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 rounded-xl focus:outline-none bg-[#fffaf2] text-[rgb(87,73,55)] placeholder-[rgba(136,153,79,0.6)] transition-all shadow-[0_0_0_1px_rgba(136,153,79,0.3)] focus:shadow-[0_0_0_2px_rgba(136,153,79,0.5)]"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-[#f8f0df] rounded-lg p-1 border border-[rgba(136,153,79,0.25)] shadow-[inset_0_1px_2px_rgba(136,153,79,0.15)]">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#fffaf1] shadow-sm text-[rgb(136,153,79)]' : 'hover:bg-[#fcf5e8] text-[rgba(136,153,79,0.75)]'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#fffaf1] shadow-sm text-[rgb(136,153,79)]' : 'hover:bg-[#fcf5e8] text-[rgba(136,153,79,0.75)]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-[#f8f0df] hover:bg-[#f0ead9] text-[rgb(136,153,79)] transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh documents"
            >
              <RefreshCcw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* New Document Button */}
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 bg-[rgb(136,153,79)] hover:bg-[rgb(118,132,68)] text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-[0_12px_30px_rgba(136,153,79,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Document
            </Link>
          </div>
        </div>
      </header>

      {/* Document Grid/List - Completely open and spacious */}
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
              transition={{ 
                duration: 0.25, 
                ease: [0.4, 0, 0.2, 1],
                layout: { 
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              layout
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-3 w-full'
              }
            >
              {viewMode === 'grid' && filteredDocuments.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ 
                    duration: 0.2, 
                    ease: [0.4, 0, 0.2, 1],
                    layout: { 
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1]
                    }
                  }}
                  whileHover={{ 
                    y: -2, 
                    scale: 1.01,
                    transition: { 
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1]
                    } 
                  }}
                  className={`group relative rounded-xl border border-[rgba(214,184,140,0.28)] bg-[#fffbf3] shadow-[0_12px_28px_rgba(214,184,140,0.15)] hover:shadow-[0_16px_32px_rgba(197,161,113,0.2)] hover:border-[rgba(197,161,113,0.42)] transition-all duration-200 cursor-pointer p-4`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenDocument(doc.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenDocument(doc.id);
                    }
                  }}
                >
                    <>
                      {/* Grid View */}
                      <div className="aspect-[3/2] rounded-lg mb-3 flex items-center justify-center bg-[#f9eedc] border border-[rgba(214,184,140,0.32)]">
                        <FileText className="w-5 h-5 text-[rgb(176,142,99)]" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h3 className="font-semibold text-[rgb(63,54,38)] group-hover:text-[rgb(176,142,99)] transition-colors line-clamp-1 text-sm flex-1">
                              {doc.title}
                            </h3>
                            <button
                              onClick={(e) => handleStar(doc, e)}
                              className="flex-shrink-0 p-1 hover:bg-[#f8eddc] rounded transition-colors"
                              title={starredIds.includes(doc.id) ? "Unstar document" : "Star document"}
                            >
                              <Star 
                                className={`w-3 h-3 ${
                                  doc.isStarred 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-[rgb(87,73,55)]'
                                }`} 
                              />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[rgba(128,108,82,0.8)] line-clamp-1">
                          {(doc.contentText ?? '').slice(0, 60)}...
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#f8eddc] text-[rgb(176,142,99)] border border-[rgba(197,161,113,0.35)]">
                              {doc.isPublic ? 'Public' : 'Private'}
                            </span>
                            <span className="text-xs text-[rgba(128,108,82,0.65)]">
                              {doc.wordCount.toLocaleString()}w
                            </span>
                          </div>
                          <span className="text-xs text-[rgba(128,108,82,0.55)]">
                            {formatDate(doc.lastEditedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-0.5 bg-[#fff7ed] rounded-md p-0.5 shadow-sm border border-[rgba(214,184,140,0.32)]">
                          <button 
                            onClick={(e) => handlePreview(doc, e)}
                            className="p-1 hover:bg-[#f8eddc] rounded transition-colors cursor-pointer" 
                            title="Preview"
                          >
                            <Eye className="w-3 h-3 text-[rgb(87,73,55)]" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteClick(doc, e)}
                            className="p-1 hover:bg-red-100 rounded transition-colors cursor-pointer" 
                            title="Delete document"
                          >
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
                    <button onClick={() => handleSort('title')} className="col-span-4 text-left cursor-pointer flex items-center gap-1">Title {sortKey==='title' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                    <button onClick={() => handleSort('wordCount')} className="col-span-2 text-left cursor-pointer flex items-center gap-1">Words {sortKey==='wordCount' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                    <button onClick={() => handleSort('updatedAt')} className="col-span-2 text-left cursor-pointer flex items-center gap-1">Updated {sortKey==='updatedAt' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                    <button onClick={() => handleSort('createdAt')} className="col-span-2 text-left cursor-pointer flex items-center gap-1">Created {sortKey==='createdAt' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                    <button onClick={() => handleSort('isPublic')} className="col-span-1 text-left cursor-pointer flex items-center gap-1">Visibility {sortKey==='isPublic' ? (sortDir==='asc' ? <ArrowBigUp className="w-3 h-3" /> : <ArrowBigDown className="w-3 h-3" />) : ''}</button>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                  <div>
                    {sortedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0 border-[rgba(214,184,140,0.2)] hover:bg-[#fffaf1] transition-colors cursor-pointer"
                        onClick={() => handleOpenDocument(doc.id)}
                      >
                        <div className="col-span-4 truncate font-medium text-[rgb(63,54,38)]">{doc.title}</div>
                        <div className="col-span-2 text-[rgba(128,108,82,0.8)]">{doc.wordCount.toLocaleString()}</div>
                        <div className="col-span-2 text-[rgba(128,108,82,0.8)]">{formatDateTime(doc.updatedAt)}</div>
                        <div className="col-span-2 text-[rgba(128,108,82,0.8)]">{formatDateTime(doc.createdAt)}</div>
                        <div className="col-span-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#f8eddc] text-[rgb(176,142,99)] border border-[rgba(197,161,113,0.35)]">
                            {doc.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleStar(doc, e)}
                            className="p-1 hover:bg-[#f8eddc] rounded transition-colors cursor-pointer"
                            title={doc.isStarred ? 'Unstar document' : 'Star document'}
                          >
                            <Star className={`w-4 h-4 ${doc.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-[rgb(87,73,55)]'}`} />
                          </button>
                          <button
                            onClick={(e) => handlePreview(doc, e)}
                            className="p-1 hover:bg-[#f8eddc] rounded transition-colors cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4 text-[rgb(87,73,55)]" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(doc, e)}
                            className="p-1 hover:bg-red-100 rounded transition-colors cursor-pointer"
                            title="Delete document"
                          >
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-16 h-16 bg-[#fff9ef] border border-[rgba(214,184,140,0.32)] rounded-full flex items-center justify-center mb-4 shadow-[0_14px_40px_rgba(197,161,113,0.2)]">
                <Search className="w-8 h-8 text-[rgb(176,142,99)]" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(63,54,38)] mb-2">No documents found</h3>
              <p className="text-sm text-[rgba(128,108,82,0.7)] text-center max-w-md">
                {searchQuery
                  ? `No documents match "${searchQuery}". Try a different search term.`
                  : 'Create your first document to get started with AI-powered writing.'
                }
              </p>
              {!searchQuery && (
                <Link
                  href="/editor"
                  className="mt-4 inline-flex items-center gap-2 bg-[rgb(197,161,113)] hover:bg-[rgb(176,142,99)] text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-[0_12px_30px_rgba(197,161,113,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  Create Document
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        starredIds={starredIds}
        onClose={() => setPreviewDocument(null)}
        onStar={handleStar}
        onOpenDocument={handleOpenDocument}
        onDeleteClick={handleDeleteClick}
        formatDate={formatDate}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        document={deleteConfirmDoc}
        onClose={() => setDeleteConfirmDoc(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}