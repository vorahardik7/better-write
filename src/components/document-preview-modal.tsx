'use client';

import { motion, AnimatePresence } from 'motion/react';
import { FileText, Star, X, Trash2 } from 'lucide-react';
import { Document } from '@/lib/store/document-store';
import { JSONContent } from '@tiptap/core';

// Component to render TipTap JSON content with proper formatting
function TipTapContentRenderer({ content }: { content: JSONContent | string }) {
  if (!content) return <div className="text-gray-500 italic">No content available</div>;
  
  // If content is a string, display it as plain text
  if (typeof content === 'string') {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // Render TipTap JSON content
  function renderNode(node: any, index: number): React.ReactNode {
    if (!node) return null;

    // Handle text nodes with marks
    if (node.type === 'text') {
      let text = node.text || '';
      
      // Apply marks (formatting)
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case 'bold':
              text = <strong key={`bold-${index}`}>{text}</strong>;
              break;
            case 'italic':
              text = <em key={`italic-${index}`}>{text}</em>;
              break;
            case 'underline':
              text = <u key={`underline-${index}`}>{text}</u>;
              break;
            case 'strike':
              text = <s key={`strike-${index}`}>{text}</s>;
              break;
            case 'code':
              text = <code key={`code-${index}`} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{text}</code>;
              break;
            case 'link':
              text = (
                <a 
                  key={`link-${index}`} 
                  href={mark.attrs?.href} 
                  className="text-blue-600 underline hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {text}
                </a>
              );
              break;
          }
        });
      }
      
      return text;
    }

    // Handle block nodes
    const children = node.content ? node.content.map((child: any, childIndex: number) => 
      renderNode(child, childIndex)
    ) : null;

    switch (node.type) {
      case 'doc':
        return <div key={index}>{children}</div>;
      
      case 'paragraph':
        return (
          <p key={index} className="mb-3 last:mb-0" style={{ textAlign: node.attrs?.textAlign }}>
            {children}
          </p>
        );
      
      case 'heading':
        const level = node.attrs?.level || 1;
        const headingClass = `mb-3 last:mb-0 font-bold ${
          level === 1 ? 'text-2xl' :
          level === 2 ? 'text-xl' :
          level === 3 ? 'text-lg' :
          'text-base'
        }`;
        
        if (level === 1) {
          return <h1 key={index} className={headingClass} style={{ textAlign: node.attrs?.textAlign }}>{children}</h1>;
        } else if (level === 2) {
          return <h2 key={index} className={headingClass} style={{ textAlign: node.attrs?.textAlign }}>{children}</h2>;
        } else if (level === 3) {
          return <h3 key={index} className={headingClass} style={{ textAlign: node.attrs?.textAlign }}>{children}</h3>;
        } else if (level === 4) {
          return <h4 key={index} className={headingClass} style={{ textAlign: node.attrs?.textAlign }}>{children}</h4>;
        } else if (level === 5) {
          return <h5 key={index} className={headingClass} style={{ textAlign: node.attrs?.textAlign }}>{children}</h5>;
        } else {
          return <h6 key={index} className={headingClass} style={{ textAlign: node.attrs?.textAlign }}>{children}</h6>;
        }
      
      case 'bulletList':
        return <ul key={index} className="list-disc list-inside mb-3 last:mb-0 space-y-1">{children}</ul>;
      
      case 'orderedList':
        return <ol key={index} className="list-decimal list-inside mb-3 last:mb-0 space-y-1">{children}</ol>;
      
      case 'listItem':
        return <li key={index}>{children}</li>;
      
      case 'blockquote':
        return (
          <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic mb-3 last:mb-0 text-gray-700">
            {children}
          </blockquote>
        );
      
      case 'codeBlock':
        return (
          <pre key={index} className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-3 last:mb-0">
            <code className="text-sm font-mono">{children}</code>
          </pre>
        );
      
      case 'hardBreak':
        return <br key={index} />;
      
      case 'image':
        return (
          <img 
            key={index}
            src={node.attrs?.src} 
            alt={node.attrs?.alt || ''}
            className="max-w-full h-auto rounded-lg shadow-sm mb-3 last:mb-0"
          />
        );
      
      default:
        return <div key={index}>{children}</div>;
    }
  }

  return <div className="prose prose-lg max-w-none">{renderNode(content, 0)}</div>;
}

interface DocumentPreviewModalProps {
  document: Document | null;
  starredIds: string[];
  onClose: () => void;
  onStar: (doc: Document, e: React.MouseEvent) => void;
  onOpenDocument: (id: string) => void;
  onDeleteClick: (doc: Document, e: React.MouseEvent) => void;
  formatDate: (dateString: string) => string;
}

export function DocumentPreviewModal({
  document,
  starredIds,
  onClose,
  onStar,
  onOpenDocument,
  onDeleteClick,
  formatDate,
}: DocumentPreviewModalProps) {
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
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[rgb(176,142,99)]" />
              <h2 className="text-xl font-semibold text-[rgb(63,54,38)]">
                {document.title}
              </h2>
              <button
                onClick={(e) => onStar(document, e)}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                title={starredIds.includes(document.id) ? "Unstar document" : "Star document"}
              >
                <Star 
                  className={`w-5 h-5 ${
                    starredIds.includes(document.id) || document.isStarred 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-400'
                  }`} 
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenDocument(document.id)}
                className="px-4 py-2 bg-[rgb(136,153,79)] hover:bg-[rgb(118,132,68)] text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                Open Document
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-gray-700 leading-relaxed">
              <TipTapContentRenderer content={document.content || document.contentText} />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{document.wordCount.toLocaleString()} words</span>
              <span>•</span>
              <span>{document.characterCount.toLocaleString()} characters</span>
              <span>•</span>
              <span>Last edited {formatDate(document.lastEditedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => onDeleteClick(document, e)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
