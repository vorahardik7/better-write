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
import { DocumentsView } from './documents-view';

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
  const [userLimits, setUserLimits] = useState<{
    limits: { maxDocuments: number; maxDocumentSizeBytes: number; maxDocumentPages: number };
    usage: { documentCount: number; storageUsed: number; averageDocumentSize: number; documentLimitRemaining: number; storageLimitRemaining: number };
    remaining: { documents: number; storagePerDocument: number; pagesPerDocument: number };
  } | null>(null);
  const [limitsError, setLimitsError] = useState<string | null>(null);
  
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
    // Fetch user limits for UI controls
    (async () => {
      try {
        setLimitsError(null);
        const res = await fetch('/api/user-limits', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to fetch user limits');
        }
        const data = await res.json();
        setUserLimits(data);
      } catch (err) {
        setLimitsError('Unable to load usage limits.');
      }
    })();
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
              className="p-2 rounded-xl hover:bg-[#f0ead9] text-[rgb(136,153,79)] transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh documents"
            >
              <RefreshCcw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* New Document Button */}
            <div className="flex flex-col items-end">
              <Link
                href={userLimits && userLimits.remaining.documents <= 0 ? '#' : '/editor'}
                aria-disabled={userLimits ? userLimits.remaining.documents <= 0 : false}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors shadow-[0_12px_30px_rgba(136,153,79,0.3)] ${
                  userLimits && userLimits.remaining.documents <= 0
                    ? 'bg:[rgba(136,153,79,0.4)] text-white cursor-not-allowed'
                    : 'bg-[rgb(136,153,79)] hover:bg-[rgb(118,132,68)] text-white cursor-pointer'
                }`}
                onClick={(e) => {
                  if (userLimits && userLimits.remaining.documents <= 0) {
                    e.preventDefault();
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                New Document
              </Link>
            </div>
          </div>
        </div>
      </header>

      <DocumentsView
        loading={loading}
        error={error}
        viewMode={viewMode}
        filteredDocuments={filteredDocuments}
        sortedDocuments={sortedDocuments}
        starredIds={starredIds}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onOpenDocument={handleOpenDocument}
        onPreview={handlePreview}
        onStar={handleStar}
        onDeleteClick={handleDeleteClick}
        previewDocument={previewDocument}
        deleteConfirmDoc={deleteConfirmDoc}
        onClosePreview={() => setPreviewDocument(null)}
        onConfirmDelete={handleDeleteConfirm}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
        onRetry={handleRefresh}
      />
    </>
  );
}