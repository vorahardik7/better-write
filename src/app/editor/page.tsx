'use client';

import { motion } from 'motion/react';
import { DemoTextEditor } from '@/components/editor/demo-text-editor';
import { DocumentChat } from '@/components/editor/document-chat';
import { FileText, Zap } from 'lucide-react';

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header - minimal */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-900 rounded-lg shadow-sm border border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">Demo Document Editor</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Select text and press</span>
            <kbd className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-mono shadow-sm text-blue-800">⌘K</kbd> 
            <span>for AI assistance</span>
          </div>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Editor Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex-1 flex flex-col bg-white"
        >
          <DemoTextEditor />
        </motion.div>

        {/* Document Chat Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-gray-50 border-l border-gray-100"
        >
          <DocumentChat />
        </motion.div>
      </div>
    </main>
  );
}