'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Eye,
  MoreHorizontal,
  FileText,
  Edit,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  title: string;
  contentHtml: string;
  contentText: string;
  createdAt: string;
  updatedAt: string;
  lastEditedAt: string;
  isArchived: boolean;
  isPublic: boolean;
  wordCount: number;
  characterCount: number;
  isStarred?: boolean;
}

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
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const router = useRouter();

  // Fetch documents on component mount
  useEffect(() => {
    if (!session?.user || initialDocuments.length > 0) {
      return;
    }

    const controller = new AbortController();

    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/documents', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch documents:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

    return () => {
      controller.abort();
    };
  }, [initialDocuments.length, session?.user]);

  const documentCounts = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      all: documents.length,
      starred: documents.filter(doc => doc.isStarred || starredIds.includes(doc.id)).length,
      recent: documents.filter(doc => new Date(doc.lastEditedAt) > oneWeekAgo).length,
      shared: documents.filter(doc => doc.isPublic).length,
      archive: documents.filter(doc => doc.isArchived).length,
    };
  }, [documents, starredIds]);

  // Notify parent of document counts
  useEffect(() => {
    if (!onDocumentCountsChange) return;
    onDocumentCountsChange(documentCounts);
  }, [documentCounts, onDocumentCountsChange]);

  const filteredDocuments = useMemo(() => {
    return documents
      .map((doc) => {
        const isStarred = starredIds.includes(doc.id) || doc.isStarred === true;
        return { ...doc, isStarred };
      })
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

  const handleOpenDocument = (id: string) => {
    router.push(`/editor?id=${id}`);
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

  return (
    <>
      {/* Header - Fixed */}
      <header className="bg-[#fdf8eb] border-b border-[rgba(136,153,79,0.2)] p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(52,63,29)]">Documents</h1>
            <p className="text-sm text-[rgba(96,108,58,0.8)] mt-1">
              Manage and organize your documents
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(96,108,58,0.55)]" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 rounded-xl focus:outline-none bg-[#fdf8eb] text-[rgb(72,84,42)] placeholder-[rgba(96,108,58,0.55)] transition-all shadow-[0_0_0_1px_rgba(136,153,79,0.2)] focus:shadow-[0_0_0_2px_rgba(136,153,79,0.45)]"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-[#f5f1df] rounded-lg p-1 border border-[rgba(136,153,79,0.15)]">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[rgba(255,250,224,0.95)] shadow-sm text-[rgb(72,84,42)]' : 'hover:bg-[rgba(245,247,239,0.8)] text-[rgba(96,108,58,0.75)]'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-[rgba(255,250,224,0.95)] shadow-sm text-[rgb(72,84,42)]' : 'hover:bg-[rgba(245,247,239,0.8)] text-[rgba(96,108,58,0.75)]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* New Document Button */}
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 bg-[rgb(136,153,79)] hover:bg-[rgb(118,132,68)] text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-[0_12px_30px_rgba(136,153,79,0.3)]"
            >
              <Plus className="w-4 h-4" />
              New Document
            </Link>
          </div>
        </div>
      </header>

      {/* Document Grid/List - Scrollable */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#f8f4e2]">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[rgba(136,153,79,0.6)] animate-spin" />
            </div>
          ) : filteredDocuments.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredDocuments.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  className={`group relative rounded-2xl border border-[rgba(136,153,79,0.16)] bg-[#fbf5e6] shadow-[0_16px_36px_rgba(136,153,79,0.16)] hover:shadow-[0_22px_48px_rgba(136,153,79,0.2)] hover:border-[rgba(136,153,79,0.28)] transition-all duration-200 cursor-pointer ${
                    viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-6'
                  }`}
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
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="aspect-[4/3] rounded-xl mb-4 flex items-center justify-center bg-[#f0ead9] border border-[rgba(136,153,79,0.18)]">
                        <FileText className="w-12 h-12 text-[rgba(96,108,58,0.7)]" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-[rgb(52,63,29)] group-hover:text-[rgb(72,84,42)] transition-colors line-clamp-2">
                            {doc.title}
                          </h3>
                        </div>

                        <p className="text-sm text-[rgba(96,108,58,0.8)] line-clamp-2">
                          {(doc.contentText ?? '').slice(0, 100)}...
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f0ead9] text-[rgb(72,84,42)] border border-[rgba(136,153,79,0.15)]">
                              {doc.isPublic ? 'Public' : 'Private'}
                            </span>
                            <span className="text-xs text-[rgba(96,108,58,0.7)]">
                              {doc.wordCount.toLocaleString()} words
                            </span>
                          </div>
                          <span className="text-xs text-[rgba(96,108,58,0.55)]">
                            {formatDate(doc.lastEditedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 bg-[#fdf8eb] rounded-lg p-1 shadow-sm border border-[rgba(136,153,79,0.15)]">
                          <button className="p-1.5 hover:bg-[#f5f1df] rounded-md transition-colors cursor-pointer" title="Preview">
                            <Eye className="w-4 h-4 text-[rgb(72,84,42)]" />
                          </button>
                          <button className="p-1.5 hover:bg-[#f5f1df] rounded-md transition-colors cursor-pointer" title="Edit">
                            <Edit className="w-4 h-4 text-[rgb(72,84,42)]" />
                          </button>
                          <button className="p-1.5 hover:bg-[#f5f1df] rounded-md transition-colors cursor-pointer" title="More options">
                            <MoreHorizontal className="w-4 h-4 text-[rgb(72,84,42)]" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="w-12 h-12 bg-[#f0ead9] border border-[rgba(136,153,79,0.18)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-[rgba(96,108,58,0.7)]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[rgb(52,63,29)] group-hover:text-[rgb(72,84,42)] transition-colors truncate">
                            {doc.title}
                          </h3>
                        </div>

                        <p className="text-sm text-[rgba(96,108,58,0.8)] line-clamp-1 mb-2">
                          {(doc.contentText ?? '').slice(0, 100)}...
                        </p>

                        <div className="flex items-center gap-4 text-xs text-[rgba(96,108,58,0.7)]">
                          <span>{doc.wordCount.toLocaleString()} words</span>
                          <span>•</span>
                          <span>{formatDate(doc.lastEditedAt)}</span>
                          <span>•</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#f0ead9] text-[rgb(72,84,42)] border border-[rgba(136,153,79,0.15)]">
                            {doc.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f0ead9] text-[rgb(72,84,42)] border border-[rgba(136,153,79,0.15)]">
                          {doc.isPublic ? 'Public' : 'Private'}
                        </span>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-[#f5f1df] rounded-md transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-4 h-4 text-[rgb(72,84,42)]" />
                            </button>
                            <button className="p-1.5 hover:bg-[#f5f1df] rounded-md transition-colors cursor-pointer" title="More options">
                              <MoreHorizontal className="w-4 h-4 text-[rgb(72,84,42)]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-16 h-16 bg-[#f0ead9] border border-[rgba(136,153,79,0.2)] rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[rgba(96,108,58,0.7)]" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(52,63,29)] mb-2">No documents found</h3>
              <p className="text-sm text-[rgba(96,108,58,0.75)] text-center max-w-md">
                {searchQuery
                  ? `No documents match "${searchQuery}". Try a different search term.`
                  : 'Create your first document to get started with AI-powered writing.'
                }
              </p>
              {!searchQuery && (
                <Link
                  href="/editor"
                  className="mt-4 inline-flex items-center gap-2 bg-[rgb(136,153,79)] hover:bg-[rgb(118,132,68)] text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-[0_12px_30px_rgba(136,153,79,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  Create Document
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

