'use client';

import { motion } from 'motion/react';
import { DemoTextEditor } from '@/components/editor/demo-text-editor';
import { ArrowLeft, Save, Share2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useEditorStore } from '@/lib/store/editor-store';
import { useAutosave } from '@/hooks/use-autosave';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';

function EditorPageContent() {
  const {
    title,
    setTitle,
    content,
    setContent,
    documentId,
    setDocumentId,
    hasUnsavedChanges,
  } = useEditorStore();

  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const documentIdParam = searchParams?.get('id') ?? null;

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    const resetDocumentState = () => {
      if (ignore) return;
      setTitle('Untitled Document');
      setContent('');
      setDocumentId(null);
      setLoadingDocument(false);
      setLoadError(null);
    };

    const loadDocument = async (id: string) => {
      setLoadingDocument(true);
      setLoadError(null);
      try {
        const response = await fetch(`/api/documents/${id}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to load document');
        }
        const data = await response.json();
        if (ignore) return;
        setTitle(data.title);
        setContent(data.content);
        setDocumentId(data.id);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        if (ignore) return;
        setLoadError('Failed to load document. Please try again.');
      } finally {
        if (ignore) return;
        setLoadingDocument(false);
      }
    };

    if (documentIdParam) {
      loadDocument(documentIdParam);
    } else {
      resetDocumentState();
    }

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [documentIdParam, setTitle, setContent, setDocumentId]);

  useAutosave({ documentId: documentId ?? undefined });

  const handleSave = async () => {
    if (saving) return;
    if (!session?.user) return;

    try {
      setSaving(true);
      setLoadError(null);
      if (!documentId) {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create document');
        }

        const data = await response.json();
        setDocumentId(data.id);
      } else {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
            isAutosave: false,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update document');
        }
      }

      useEditorStore.getState().setHasUnsavedChanges(false);
    } catch (error) {
      console.error(error);
      setLoadError('Failed to save document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <header className="border-b border-black/5 bg-white h-16">
        <div className="flex items-center justify-between px-6 h-full">
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
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Untitled Document"
                  className="text-lg font-semibold text-slate-900 bg-transparent border-none focus:outline-none"
                />
                <p className="text-xs font-medium text-slate-500">
                  {loadError
                    ? loadError
                    : loadingDocument
                    ? 'Loading document...'
                    : saving
                    ? 'Saving...'
                    : hasUnsavedChanges
                    ? 'Unsaved changes'
                    : 'All changes saved'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-black/30 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Saving...' : 'Save'}
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
        {loadingDocument && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              Loading document...
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
          Loading editor...
        </div>
      </div>
    }>
      <EditorPageContent />
    </Suspense>
  );
}