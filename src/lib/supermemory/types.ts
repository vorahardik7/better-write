/**
 * Supermemory sync status for documents
 */
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'skipped';

/**
 * Result from syncing a document to Supermemory
 */
export interface SyncResult {
  success: boolean;
  supermemoryDocId?: string;
  skipped?: boolean;
  reason?: string;
  error?: string;
}

/**
 * Document metadata stored in Supermemory
 */
export interface SupermemoryDocumentMetadata {
  title: string;
  userId: string;
  wordCount: number;
  createdAt: string;
  lastEditedAt: string;
  isArchived: string; // Supermemory requires string/number/boolean
  documentType: string;
}

/**
 * Search result from Supermemory with document mapping
 */
export interface EnhancedSearchResult {
  documentId: string;
  title: string;
  score: number;
  matchedChunks: Array<{
    content: string;
    score: number;
    isRelevant: boolean;
  }>;
  contentText?: string;
  wordCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Context item from Supermemory for AI suggestions
 */
export interface SupermemoryContext {
  content: string;
  source?: string;
  relevance: number;
  documentId?: string;
}

/**
 * Options for document sync
 */
export interface SyncOptions {
  force?: boolean; // Force sync even if content hash matches
  skipIfArchived?: boolean; // Skip archived documents (default: true)
  minWordCount?: number; // Minimum word count to sync (default: 0)
  containerTag?: string; // Single tag (recommended for performance)
  containerTags?: string[]; // Multiple tags (more flexible but slower)
}

/**
 * Options for semantic search
 */
export interface SearchOptions {
  limit?: number;
  chunkThreshold?: number;
  rerank?: boolean;
  rewriteQuery?: boolean;
  onlyMatchingChunks?: boolean;
  containerTag?: string; // Single tag (recommended for performance)
  containerTags?: string[]; // Multiple tags (slower but more flexible)
}

