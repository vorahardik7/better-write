'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { Document } from '@/lib/store/document-store';

interface DeleteConfirmationDialogProps {
  document: Document | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationDialog({
  document,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  if (!document) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "<span className="font-medium">{document.title}</span>"? 
            This action cannot be undone.
          </p>
          
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
