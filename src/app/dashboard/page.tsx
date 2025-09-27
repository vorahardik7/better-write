'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, LogOut, User, Clock, Star, Zap, Edit3, BookOpen, Brain, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCounter } from '@/hooks/useCounter';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Animated counters
  const documentsCount = useCounter(12, 2000);
  const wordsCount = useCounter(2000, 2500);
  const charactersCount = useCounter(18000, 3000);
  const aiSuggestionsCount = useCounter(150, 1800);

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/'); // Not authenticated, redirect to home
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-600"></div>
          <p className="text-gray-600 font-light">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-pattern">
      {/* Header */}
      <header className="bg-white border-b border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src="/better-write.ico"
                  alt="BetterWrite Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-light text-black">
                BetterWrite
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm font-light text-gray-700">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-black transition-colors cursor-pointer text-sm font-light p-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.h2 
            className="text-5xl font-light text-black mb-4 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome back, <span className="font-normal text-gray-700">{session.user?.name?.split(' ')[0]}</span>
          </motion.h2>
          <motion.p 
            className="text-lg font-light text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Your AI-powered writing workspace is ready.
          </motion.p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-black">{documentsCount.toLocaleString()}</p>
              <p className="text-xs font-light text-gray-500">Documents</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <Edit3 className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-black">{wordsCount.toLocaleString()}</p>
              <p className="text-xs font-light text-gray-500">Words</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-black">{charactersCount.toLocaleString()}</p>
              <p className="text-xs font-light text-gray-500">Characters</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-black">{aiSuggestionsCount.toLocaleString()}</p>
              <p className="text-xs font-light text-gray-500">AI Suggestions</p>
            </div>
          </div>
        </div>

        {/* Recent Documents Section */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-light text-black">Recent Documents</h3>
              </div>
              <Link href="/editor">
                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-light hover:bg-gray-800 transition-colors cursor-pointer flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Document</span>
                </button>
              </Link>
            </div>
          </div>
          <div className="p-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
              <h4 className="text-xl font-light text-black mb-3">No documents yet</h4>
              <p className="text-gray-600 text-sm font-light mb-6 max-w-md mx-auto">
                Create your first document to get started with AI-powered writing assistance
              </p>
              <Link href="/editor">
                <button className="bg-black text-white px-6 py-3 rounded-lg text-sm font-light hover:bg-gray-800 transition-colors cursor-pointer">
                  Start Writing
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
