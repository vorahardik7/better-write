'use client';

import { motion } from 'motion/react';
import { DemoTextEditor } from '@/components/editor/demo-text-editor';
import { FileText } from 'lucide-react';

export default function EditorPage() {
  return (
    <main className="h-screen bg-gray-50 flex flex-col">
      
      {/* Main Content */}
      <div className="relative z-10 flex-1 flex min-h-0">
        {/* Editor Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex-1 flex flex-col bg-white min-w-0"
        >
          <DemoTextEditor />
        </motion.div>

        {/* Document Chat Sidebar - temporarily removed */}
      </div>
    </main>
  );
}