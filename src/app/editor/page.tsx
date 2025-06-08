'use client';

import { motion } from 'motion/react';
import { TextEditor } from '@/components/editor/text-editor';
import { DocumentChat } from '@/components/editor/document-chat';
import { Sparkles, FileText, Zap } from 'lucide-react';

export default function EditorPage() {
  return (
    <main className="h-screen bg-blue-50 flex flex-col overflow-hidden">
      {/* Blue Background Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 bg-purple-200/25 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-100/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Clean Blue Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/95 backdrop-blur-sm px-6 py-4 shadow-sm border-b border-blue-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-900 rounded-lg shadow-sm border border-blue-100">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Document Editor</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-blue-800 bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Select text and press</span>
            <kbd className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-mono shadow-sm text-blue-800">⌘K</kbd> 
            <span>for AI assistance</span>
          </div>
        </div>
      </motion.header>
      
      {/* Clean Main Content Area */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Editor Container - Clean blue writing environment */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 flex flex-col bg-white"
        >
          <TextEditor />
        </motion.div>

        {/* Document Chat Sidebar - Clean blue */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-blue-50/80 backdrop-blur-sm border-l border-blue-100"
        >
          <DocumentChat />
        </motion.div>
      </div>
    </main>
  );
} 