import { useCallback } from 'react';
import { useDocumentStore } from '@/lib/store/document-store';
import { useEditorStore } from '@/lib/store/editor-store';
import type { Document } from '@/lib/store/document-store';

// Helper function to extract text from TipTap JSON content
function extractTextFromJson(jsonContent: any): string {
  if (!jsonContent) return '';
  
  function extractText(node: any): string {
    if (typeof node === 'string') return node;
    if (typeof node !== 'object' || !node) return '';
    
    if (node.text) return node.text;
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join('');
    }
    
    return '';
  }
  
  return extractText(jsonContent).trim();
}

export function useDocumentOperations() {
  const documentStore = useDocumentStore();
  const editorStore = useEditorStore();

  // Create a new document with optimistic updates
  const createDocument = useCallback(async (title: string, content: any) => {
    const contentText = extractTextFromJson(content);
    const wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = contentText.length;
    const now = new Date();

    // Create optimistic document
    const optimisticDoc: Document = {
      id: '', // Will be replaced with real ID
      title,
      contentText,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      lastEditedAt: now.toISOString(),
      isArchived: false,
      isPublic: false,
      wordCount,
      characterCount,
    };

    // Add optimistically to store
    const tempId = documentStore.addDocumentOptimistic(optimisticDoc);

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const newDocument = await response.json();
      
      // Replace optimistic document with real one
      documentStore.resolveOptimisticUpdate(tempId, newDocument);
      
      return newDocument;
    } catch (error) {
      // Revert optimistic update on error
      documentStore.revertOptimisticUpdate(tempId);
      throw error;
    }
  }, [documentStore]);

  // Update document with optimistic updates
  const updateDocument = useCallback(async (id: string, updates: { title?: string; content?: any }) => {
    // Apply optimistic update
    documentStore.updateDocumentOptimistic(id, updates);

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const updatedDocument = await response.json();
      
      // Update store with real data
      documentStore.updateDocument(id, updatedDocument);
      
      return updatedDocument;
    } catch (error) {
      // Revert optimistic update on error
      documentStore.revertOptimisticUpdate(id);
      throw error;
    }
  }, [documentStore]);

  // Delete/archive document with optimistic updates
  const deleteDocument = useCallback(async (id: string) => {
    // Apply optimistic update
    documentStore.removeDocumentOptimistic(id);

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Document is archived, not actually deleted
      documentStore.archiveDocument(id);
      
      return true;
    } catch (error) {
      // Revert optimistic update on error
      documentStore.revertOptimisticUpdate(id);
      throw error;
    }
  }, [documentStore]);

  // Save document from editor
  const saveDocumentFromEditor = useCallback(async () => {
    const { documentId, title, content, hasUnsavedChanges } = editorStore;
    
    if (!documentId || !hasUnsavedChanges) {
      return;
    }

    try {
      await updateDocument(documentId, { title, content });
      editorStore.setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save document:', error);
      throw error;
    }
  }, [editorStore, updateDocument]);

  // Create document from editor
  const createDocumentFromEditor = useCallback(async () => {
    const { title, content } = editorStore;
    
    try {
      const newDocument = await createDocument(title, content);
      
      // Update editor store with new document ID
      editorStore.setDocumentId(newDocument.id);
      editorStore.setHasUnsavedChanges(false);
      
      return newDocument;
    } catch (error) {
      console.error('Failed to create document:', error);
      throw error;
    }
  }, [editorStore, createDocument]);

  return {
    createDocument,
    updateDocument,
    deleteDocument,
    saveDocumentFromEditor,
    createDocumentFromEditor,
  };
}
