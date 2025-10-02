'use client';

import { motion } from 'motion/react';
import { DemoTextEditor } from '@/components/editor/demo-text-editor';
import { ArrowLeft, Save, Share2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function EditorPage() {

  return (
    <div className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <header className="border-b border-black/5 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-black/30 hover:text-slate-900 hover:shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-black/10" />
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Untitled Document</h1>
                <p className="text-xs font-medium text-slate-500">Last saved just now</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-black/30 hover:text-slate-900 hover:bg-slate-50">
              <Save className="h-4 w-4" />
              Save
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black shadow-sm">
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-black/30 hover:text-slate-900 hover:bg-slate-50">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="h-full flex flex-col bg-white"
        >
          <DemoTextEditor />
        </motion.div>
      </main>
    </div>
  );
}