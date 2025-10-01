'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Plus,
  LogOut,
  User,
  Edit3,
  Brain,
  Sparkles,
  ArrowRight,
  FileEdit,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const recentDocuments = [
    {
      id: 1,
      title: 'Q4 Product Strategy',
      lastModified: '2 hours ago',
      wordCount: 1247,
      status: 'draft',
    },
    {
      id: 2,
      title: 'User Research Report',
      lastModified: '1 day ago',
      wordCount: 2891,
      status: 'review',
    },
    {
      id: 3,
      title: 'Team Meeting Notes',
      lastModified: '3 days ago',
      wordCount: 456,
      status: 'completed',
    },
  ];

  const quickActions = [
    {
      label: 'New Document',
      description: 'Start with a blank page',
      href: '/editor',
      icon: Plus,
      primary: true,
    },
    {
      label: 'AI Template',
      description: 'Choose from AI-generated templates',
      href: '/editor?template=true',
      icon: Sparkles,
    },
    {
      label: 'Import Document',
      description: 'Upload existing files',
      href: '/editor?import=true',
      icon: FileEdit,
    },
  ];

  const stats = [
    {
      label: 'Documents',
      value: '12',
      icon: FileText,
      change: '+3 this week',
    },
    {
      label: 'Words Written',
      value: '8,247',
      icon: Edit3,
      change: '+1,200 today',
    },
    {
      label: 'AI Suggestions',
      value: '47',
      icon: Brain,
      change: '12 pending',
    },
  ];

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/');
  }, [session, status, router]);

  if (status === 'loading') {
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
    <div className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/90 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <Image
                src="/better-write.ico"
                alt="BetterWrite"
                width={24}
                height={24}
                className="h-6 w-6"
                priority
              />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">BetterWrite</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-2">
              <span className="text-lg">⚡</span>
              <span className="text-sm font-semibold text-slate-900">4</span>
              <span className="text-xs text-slate-500">day streak</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-2">
              <User className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{session.user?.name}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-black/30 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 h-[calc(100vh-4rem)]">
        <div className="grid gap-6 lg:grid-cols-3 h-full max-w-7xl mx-auto">
          {/* Left Column - Recent Documents First */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <motion.section
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Welcome back
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Ready to write, {session.user?.name?.split(' ')[0]}?
                  </h2>
                  <p className="text-slate-600 max-w-md text-sm">
                    Your AI-powered writing assistant is ready to help you create professional documents.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-slate-900">4</div>
                  <div className="text-xs font-medium text-slate-500">day streak</div>
                </div>
              </div>
            </motion.section>

            {/* Recent Documents - Scalable Design */}
            <motion.section
              className="rounded-3xl border border-black/5 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between p-6 pb-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-900">Recent Documents</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {recentDocuments.length} total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/editor"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-black/25"
                  >
                    <Plus className="h-4 w-4" />
                    New
                  </Link>
                  {recentDocuments.length > 3 && (
                    <Link
                      href="/documents"
                      className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-[#f5f4f0] px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-black/20"
                    >
                      View all
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="p-6 pt-4">
                {recentDocuments.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentDocuments.slice(0, 5).map((doc) => (
                      <Link
                        key={doc.id}
                        href="/editor"
                        className="group flex items-center justify-between rounded-2xl border border-black/5 bg-[#f5f4f0] p-4 transition hover:border-black/20 hover:bg-white"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl">
                            <FileText className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 truncate">{doc.title}</div>
                            <div className="text-sm text-slate-500">
                              {doc.wordCount.toLocaleString()} words • {doc.lastModified}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            doc.status === 'draft' 
                              ? 'bg-yellow-100 text-yellow-700'
                              : doc.status === 'review'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {doc.status}
                          </span>
                          <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    ))}
                    {recentDocuments.length > 5 && (
                      <div className="text-center py-4">
                        <span className="text-sm text-slate-500">
                          And {recentDocuments.length - 5} more documents...
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-black/15 bg-[#f5f4f0] p-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-400" />
                    <h4 className="mt-4 text-lg font-semibold text-slate-900">No documents yet</h4>
                    <p className="mt-2 text-sm text-slate-500">
                      Create your first document to get started with AI-powered writing.
                    </p>
                    <Link
                      href="/editor"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      <Plus className="h-4 w-4" />
                      Start writing
                    </Link>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Quick Actions - Smaller and More Compact */}
            <motion.section
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={`group flex items-center gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                        action.primary
                          ? 'border-slate-900 bg-slate-900 text-white hover:bg-black'
                          : 'border-black/10 bg-[#f5f4f0] text-slate-900 hover:border-black/20'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${action.primary ? 'text-white' : 'text-slate-700'}`} />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{action.label}</div>
                        <div className={`text-xs ${action.primary ? 'text-white/70' : 'text-slate-500'}`}>
                          {action.description}
                        </div>
                      </div>
                      <ArrowRight className={`h-4 w-4 transition group-hover:translate-x-0.5 ${
                        action.primary ? 'text-white' : 'text-slate-400'
                      }`} />
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          </div>

          {/* Right Column - Enhanced Stats */}
          <div className="space-y-6">
            {/* Enhanced Stats */}
            <motion.section
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Brain className="h-5 w-5 text-slate-500" />
                <h3 className="text-lg font-semibold text-slate-900">Your Progress</h3>
              </div>
              <div className="space-y-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-[#f5f4f0] to-white p-4 transition hover:border-black/20 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl">
                            <Icon className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{stat.label}</div>
                            <div className="text-xs text-slate-500">{stat.change}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>


            {/* Quick Stats */}
            <motion.section
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-green-50 p-3">
                  <div className="text-sm font-medium text-green-800">Words written</div>
                  <div className="text-sm font-bold text-green-900">2,847</div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3">
                  <div className="text-sm font-medium text-blue-800">AI suggestions</div>
                  <div className="text-sm font-bold text-blue-900">23</div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3">
                  <div className="text-sm font-medium text-purple-800">Documents edited</div>
                  <div className="text-sm font-bold text-purple-900">8</div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}
