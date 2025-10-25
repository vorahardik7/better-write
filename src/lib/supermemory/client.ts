import Supermemory from 'supermemory';

if (!process.env.SUPERMEMORY_API_KEY) {
  console.warn('Warning: SUPERMEMORY_API_KEY is not set. Supermemory features will be disabled.');
}

/**
 * Supermemory client instance for knowledge graph and semantic search
 * 
 * Used for:
 * - Syncing documents to Supermemory knowledge graph
 * - Semantic search across user's documents
 * - Providing context for AI suggestions
 * - Building cross-document relationships
 */
export const supermemoryClient = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY || '',
});

/**
 * Check if Supermemory is enabled and configured
 */
export function isSupermemoryEnabled(): boolean {
  return !!(
    process.env.SUPERMEMORY_API_KEY && 
    process.env.ENABLE_SUPERMEMORY_SYNC !== 'false'
  );
}

/**
 * Get container tag for a user's memories
 * All memories for a user are grouped under this tag to enable
 * knowledge graph relationships across documents
 */
export function getUserContainerTag(userId: string): string {
  return `user_${userId}`;
}

