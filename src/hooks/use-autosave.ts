import { useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '@/lib/store/editor-store';

interface UseAutosaveOptions {
  documentId?: string;
  enabled?: boolean;
  interval?: number; // in milliseconds
}

export function useAutosave({
  documentId,
  enabled = true,
  interval = 30000 // 30 seconds
}: UseAutosaveOptions) {
  const { content, title, hasUnsavedChanges, setHasUnsavedChanges } = useEditorStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveDocument = useCallback(async () => {
    if (!documentId || !hasUnsavedChanges) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          isAutosave: true,
        }),
      });

      if (response.ok) {
        console.log('Document autosaved successfully');
        setHasUnsavedChanges(false);
      } else {
        console.error('Failed to autosave document');
      }
    } catch (error) {
      console.error('Error autosaving document:', error);
    }
  }, [documentId, title, content, hasUnsavedChanges, setHasUnsavedChanges]);

  useEffect(() => {
    if (!enabled || !documentId || !hasUnsavedChanges) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveDocument();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, documentId, hasUnsavedChanges, saveDocument, interval]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return {
    saveDocument,
  };
}

