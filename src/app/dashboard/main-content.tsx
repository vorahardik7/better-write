'use client';

import { useState, useEffect } from 'react';
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
}

interface MainContentProps {
  initialDocuments?: Document[];
}

export function MainContent({ initialDocuments = [] }: MainContentProps) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!session?.user) return;
      setLoading(true);
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents || []);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    if (initialDocuments.length === 0) {
      fetchDocuments();
    }
  }, [initialDocuments.length, session?.user]);

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.contentText?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

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
      <header className="bg-white border-b border-black/5 p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and organize your documents
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                }`}
              >
                <Grid3X3 className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                }`}
              >
                <List className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* New Document Button */}
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Document
            </Link>
          </div>
        </div>
      </header>

      {/* Document Grid/List - Scrollable */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
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
                  className={`group relative bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-lg hover:border-black/10 transition-all duration-200 cursor-pointer ${
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
                      <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl mb-4 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-slate-400" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">
                            {doc.title}
                          </h3>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2">
                          {(doc.contentText ?? '').slice(0, 100)}...
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              {doc.isPublic ? 'Public' : 'Private'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {doc.wordCount.toLocaleString()} words
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDate(doc.lastEditedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                          <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" title="Preview">
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" title="Edit">
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" title="More options">
                            <MoreHorizontal className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-slate-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors truncate">
                            {doc.title}
                          </h3>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-1 mb-2">
                          {(doc.contentText ?? '').slice(0, 100)}...
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{doc.wordCount.toLocaleString()} words</span>
                          <span>•</span>
                          <span>{formatDate(doc.lastEditedAt)}</span>
                          <span>•</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                            {doc.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {doc.isPublic ? 'Public' : 'Private'}
                        </span>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" title="More options">
                              <MoreHorizontal className="w-4 h-4 text-slate-600" />
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
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents found</h3>
              <p className="text-sm text-slate-500 text-center max-w-md">
                {searchQuery
                  ? `No documents match "${searchQuery}". Try a different search term.`
                  : 'Create your first document to get started with AI-powered writing.'
                }
              </p>
              {!searchQuery && (
                <Link
                  href="/editor"
                  className="mt-4 inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl font-semibold transition-colors"
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

