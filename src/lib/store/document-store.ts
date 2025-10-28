import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

// Enable Immer MapSet plugin for Map/Set support
enableMapSet();

// Document interface matching the database schema and API response
export interface Document {
  id: string;
  title: string;
  contentText: string;
  createdAt: string;
  updatedAt: string;
  lastEditedAt: string;
  isArchived: boolean;
  isPublic: boolean;
  wordCount: number;
  characterCount: number;
  isStarred?: boolean;
  supermemoryDocId?: string;
}

// Pagination info from API
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Store state interface
interface DocumentStoreState {
  // Document list data
  documents: Document[];
  pagination: PaginationInfo | null;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Cache management
  lastFetched: number | null;
  cacheExpiry: number; // Cache duration in milliseconds (5 minutes default)
  
  // Optimistic updates tracking
  optimisticUpdates: Map<string, Document>;
  
  // Actions
  setDocuments: (documents: Document[], pagination?: PaginationInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Document operations
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  archiveDocument: (id: string) => void;
  
  // Optimistic operations
  addDocumentOptimistic: (document: Document) => string; // Returns temp ID
  updateDocumentOptimistic: (id: string, updates: Partial<Document>) => void;
  removeDocumentOptimistic: (id: string) => void;
  resolveOptimisticUpdate: (tempId: string, realDocument: Document) => void;
  revertOptimisticUpdate: (tempId: string) => void;
  
  // Cache management
  fetchDocuments: (forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
  isCacheValid: () => boolean;
  
  // Utility functions
  getDocumentById: (id: string) => Document | undefined;
  getDocumentCounts: () => {
    all: number;
    starred: number;
    recent: number;
    shared: number;
    archive: number;
  };
}

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

// Helper function to generate ETag for cache validation
function generateETag(documents: Document[]): string {
  if (documents.length === 0) return '"empty"';
  
  const latestUpdate = Math.max(
    ...documents.map(doc => new Date(doc.updatedAt).getTime())
  );
  
  return `"${documents.length}-${latestUpdate}"`;
}

export const useDocumentStore = create<DocumentStoreState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      documents: [],
      pagination: null,
      loading: false,
      error: null,
      lastFetched: null,
      cacheExpiry: 5 * 60 * 1000, // 5 minutes
      optimisticUpdates: new Map(),

      // Basic setters
      setDocuments: (documents, pagination) => set((state) => {
        state.documents = documents;
        state.pagination = pagination || null;
        state.lastFetched = Date.now();
        state.error = null;
      }),

      setLoading: (loading) => set((state) => {
        state.loading = loading;
      }),

      setError: (error) => set((state) => {
        state.error = error;
        state.loading = false;
      }),

      // Document operations
      addDocument: (document) => set((state) => {
        state.documents.unshift(document); // Add to beginning
      }),

      updateDocument: (id, updates) => set((state) => {
        const index = state.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
          state.documents[index] = { ...state.documents[index], ...updates };
        }
      }),

      removeDocument: (id) => set((state) => {
        state.documents = state.documents.filter(doc => doc.id !== id);
      }),

      archiveDocument: (id) => set((state) => {
        const index = state.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
          state.documents[index].isArchived = true;
        }
      }),

      // Optimistic operations
      addDocumentOptimistic: (document) => {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempDocument = { ...document, id: tempId };
        
        set((state) => {
          state.documents.unshift(tempDocument);
          state.optimisticUpdates.set(tempId, tempDocument);
        });
        
        return tempId;
      },

      updateDocumentOptimistic: (id, updates) => set((state) => {
        const index = state.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
          const originalDoc = { ...state.documents[index] };
          state.documents[index] = { ...state.documents[index], ...updates };
          
          // Track optimistic update
          if (!state.optimisticUpdates.has(id)) {
            state.optimisticUpdates.set(id, originalDoc);
          }
        }
      }),

      removeDocumentOptimistic: (id) => set((state) => {
        const index = state.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
          const originalDoc = state.documents[index];
          state.documents.splice(index, 1);
          
          // Track optimistic update
          if (!state.optimisticUpdates.has(id)) {
            state.optimisticUpdates.set(id, originalDoc);
          }
        }
      }),

      resolveOptimisticUpdate: (tempId, realDocument) => set((state) => {
        const index = state.documents.findIndex(doc => doc.id === tempId);
        if (index !== -1) {
          state.documents[index] = realDocument;
          state.optimisticUpdates.delete(tempId);
        }
      }),

      revertOptimisticUpdate: (tempId) => set((state) => {
        const originalDoc = state.optimisticUpdates.get(tempId);
        if (originalDoc) {
          const index = state.documents.findIndex(doc => doc.id === tempId);
          if (index !== -1) {
            state.documents[index] = originalDoc;
          }
          state.optimisticUpdates.delete(tempId);
        }
      }),

      // Cache management
      fetchDocuments: async (forceRefresh = false) => {
        const state = get();
        
        // Check if cache is valid and not forcing refresh
        if (!forceRefresh && state.isCacheValid()) {
          return;
        }

        console.log('🔄 Starting to fetch documents...');
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Generate ETag for conditional request
          const etag = state.documents.length > 0 ? generateETag(state.documents) : null;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (etag) {
            headers['If-None-Match'] = etag;
          }

          console.log('📡 Making API request to /api/documents...');
          
          // Add timeout to prevent infinite loading
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.warn('⏰ Request timeout after 10 seconds');
            controller.abort();
          }, 10000);
          
          const response = await fetch('/api/documents', {
            method: 'GET',
            headers,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          console.log('📥 Received response:', response.status);

          if (response.status === 304) {
            // Not modified - update lastFetched but keep existing data
            console.log('✅ Cache valid, no changes needed');
            set((state) => {
              state.lastFetched = Date.now();
              state.loading = false;
            });
            return;
          }

          if (!response.ok) {
            console.error('❌ API request failed:', response.status);
            throw new Error(`Failed to fetch documents: ${response.status}`);
          }

          const data = await response.json();
          console.log('✅ Successfully fetched documents:', data.documents?.length || 0);
          
          set((state) => {
            state.documents = data.documents || [];
            state.pagination = data.pagination || null;
            state.lastFetched = Date.now();
            state.loading = false;
            state.error = null;
          });

        } catch (error) {
          console.error('❌ Failed to fetch documents:', error);
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch documents';
            state.loading = false;
          });
        }
      },

      clearCache: () => set((state) => {
        state.documents = [];
        state.pagination = null;
        state.lastFetched = null;
        state.error = null;
        state.optimisticUpdates.clear();
      }),

      isCacheValid: () => {
        const state = get();
        if (!state.lastFetched) return false;
        return (Date.now() - state.lastFetched) < state.cacheExpiry;
      },

      // Utility functions
      getDocumentById: (id) => {
        const state = get();
        return state.documents.find(doc => doc.id === id);
      },

      getDocumentCounts: () => {
        const state = get();
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
          all: state.documents.length,
          starred: state.documents.filter(doc => doc.isStarred).length,
          recent: state.documents.filter(doc => new Date(doc.lastEditedAt) > oneWeekAgo).length,
          shared: state.documents.filter(doc => doc.isPublic).length,
          archive: state.documents.filter(doc => doc.isArchived).length,
        };
      },
    })),
    {
      name: 'document-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        documents: state.documents.filter(doc => !doc.id.startsWith('temp-')),
        lastFetched: state.lastFetched,
        pagination: state.pagination,
      }),
    }
  )
);

