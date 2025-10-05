'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FileText,
  Edit3,
  Brain,
  Zap,
  BookOpen,
  Star,
  Clock,
  Archive,
  Edit,
  Share,
  Download,
  ArrowRight,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from './sidebar';
import { MainContent } from './main-content';

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const documents = [
    {
      id: 1,
      title: 'Q4 Product Strategy',
      lastModified: '2 hours ago',
      wordCount: 1247,
      status: 'draft',
      preview: 'This comprehensive strategy outlines our product roadmap for Q4, focusing on user experience improvements and new feature development...',
      tags: ['strategy', 'product', 'planning'],
      starred: true,
    },
    {
      id: 2,
      title: 'User Research Report',
      lastModified: '1 day ago',
      wordCount: 2891,
      status: 'review',
      preview: 'Based on extensive user interviews and data analysis, this report highlights key insights about user behavior and preferences...',
      tags: ['research', 'users', 'analysis'],
      starred: false,
    },
    {
      id: 3,
      title: 'Team Meeting Notes',
      lastModified: '3 days ago',
      wordCount: 456,
      status: 'completed',
      preview: 'Weekly team sync discussing project progress, upcoming milestones, and addressing any blockers in the development pipeline...',
      tags: ['meeting', 'notes', 'team'],
      starred: false,
    },
    {
      id: 4,
      title: 'Marketing Campaign Brief',
      lastModified: '5 days ago',
      wordCount: 892,
      status: 'draft',
      preview: 'Campaign objectives, target audience analysis, key messaging, and success metrics for our upcoming product launch...',
      tags: ['marketing', 'campaign', 'brief'],
      starred: true,
    },
    {
      id: 5,
      title: 'Technical Documentation',
      lastModified: '1 week ago',
      wordCount: 3421,
      status: 'completed',
      preview: 'Complete technical documentation covering API endpoints, data structures, and integration guidelines for developers...',
      tags: ['technical', 'documentation', 'api'],
      starred: false,
    },
  ];

  const stats = [
    {
      label: 'Writing Streak',
      value: '4',
      icon: Zap,
      change: 'days',
      color: 'slate',
    },
  ];

  const navigationItems = [
    { label: 'All Documents', icon: BookOpen, active: true },
    { label: 'Starred', icon: Star, active: false },
    { label: 'Recent', icon: Clock, active: false },
    { label: 'Archive', icon: Archive, active: false },
  ];

  useEffect(() => {
    if (isPending) return;
    if (!session) router.push('/');
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-600"></div>
          <p className="text-slate-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen bg-[#f5f4f0] flex overflow-hidden">
      <Sidebar
        documents={documents}
        stats={stats}
        navigationItems={navigationItems}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MainContent
          documents={documents}
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
        />
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-black/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{selectedDocument.title}</h3>
                      <p className="text-sm text-slate-500">
                        {selectedDocument.wordCount.toLocaleString()} words • {selectedDocument.lastModified}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <p className="text-slate-700 leading-relaxed">
                  {selectedDocument.preview}
                </p>

                {selectedDocument.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-black/5">
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-black/5 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedDocument.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-700'
                        : selectedDocument.status === 'review'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedDocument.status}
                    </span>
                    {selectedDocument.starred && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer" title="Edit">
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer" title="Share">
                      <Share className="w-4 h-4 text-slate-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer" title="Download">
                      <Download className="w-4 h-4 text-slate-600" />
                    </button>
                    <Link
                      href="/editor"
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Open Document
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
