import { supermemoryClient, isSupermemoryEnabled, getUserContainerTag } from './client';
import { db, documents } from '../db';
import { eq, inArray, and } from 'drizzle-orm';
import type { EnhancedSearchResult, SearchOptions, SupermemoryContext } from './types';

/**
 * Semantic search across user's documents using Supermemory
 * Maps Supermemory results back to Supabase documents
 * 
 * @param query - Search query (natural language or keywords)
 * @param userId - User ID to search within
 * @param options - Search configuration options
 * @returns Array of enhanced search results with document data
 */
export async function searchDocuments(
  query: string,
  userId: string,
  options: SearchOptions = {}
): Promise<EnhancedSearchResult[]> {
  if (!isSupermemoryEnabled()) {
    console.log('Supermemory search disabled, falling back to basic search');
    return basicTextSearch(query, userId);
  }

  const {
    limit = 10,
    chunkThreshold = 0.6,
    rerank = true,
    rewriteQuery = true,
    onlyMatchingChunks = false,
  } = options;

  try {
    // 1. Determine container tags for search
    let searchContainerTags: string[];
    if (options.containerTag) {
      // Single tag (recommended for performance)
      searchContainerTags = [options.containerTag];
    } else if (options.containerTags && options.containerTags.length > 0) {
      // Multiple tags (more flexible but slower)
      searchContainerTags = options.containerTags;
    } else {
      // Default to user's container tag
      searchContainerTags = [getUserContainerTag(userId)];
    }

    // 2. Search Supermemory with semantic understanding
    const results = await supermemoryClient.search.documents({
      q: query,
      containerTags: searchContainerTags,
      limit: limit,
      chunkThreshold: chunkThreshold,
      rerank: rerank,
      rewriteQuery: rewriteQuery,
      onlyMatchingChunks: onlyMatchingChunks,
      filters: {
        AND: [
          { key: "userId", value: userId, negate: false },
          { key: "isArchived", value: "true", negate: true }
        ]
      }
    });

    // 3. Extract document IDs from Supermemory results
    // Using customId which we set to our document.id
    const documentIds = results.results
      .map(r => r.documentId)
      .filter((id): id is string => id !== undefined && id !== null);

    if (documentIds.length === 0) {
      return [];
    }

    // 4. Fetch full document data from Supabase using Drizzle
    const documentsResult = await db
      .select({
        id: documents.id,
        title: documents.title,
        contentText: documents.contentText,
        wordCount: documents.wordCount,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(and(
        inArray(documents.id, documentIds),
        eq(documents.userId, userId)
      ));

    const documentsMap = new Map(
      documentsResult.map(doc => [doc.id, doc])
    );

    // 5. Combine Supermemory results with Supabase data
    const enhancedResults: EnhancedSearchResult[] = results.results.map(result => {
      const doc = documentsMap.get(result.documentId || '');
      
      return {
        documentId: result.documentId || '',
        title: doc?.title || result.title || 'Untitled',
        score: result.score || 0,
        matchedChunks: (result.chunks || []).map(chunk => ({
          content: chunk.content || '',
          score: chunk.score || 0,
          isRelevant: chunk.isRelevant ?? true
        })),
        contentText: doc?.contentText || undefined,
        wordCount: doc?.wordCount,
        createdAt: doc?.createdAt,
        updatedAt: doc?.updatedAt
      };
    });

    return enhancedResults;

  } catch (error) {
    console.error('Supermemory search failed:', error);
    // Fallback to basic text search
    return basicTextSearch(query, userId);
  }
}

/**
 * Get relevant context from Supermemory for AI suggestions
 * Finds related content from other documents based on current selection
 * 
 * @param selectedText - The text user is working with
 * @param currentDocumentId - Current document ID (to exclude from results)
 * @param userId - User ID
 * @param limit - Maximum number of context items
 * @returns Array of relevant context from other documents
 */
export async function getAIContext(
  selectedText: string,
  currentDocumentId: string,
  userId: string,
  limit: number = 5
): Promise<SupermemoryContext[]> {
  if (!isSupermemoryEnabled() || !selectedText.trim()) {
    return [];
  }

  try {
    // Search for related content, excluding current document
    const results = await supermemoryClient.search.documents({
      q: selectedText,
      containerTags: [getUserContainerTag(userId)],
      limit: limit,
      chunkThreshold: 0.7,
      rerank: true,
      onlyMatchingChunks: true, // Just the relevant chunks
      filters: {
        AND: [
          { key: "userId", value: userId, negate: false },
          { key: "isArchived", value: "true", negate: true }
        ]
      }
    });

    // Convert to context format
    const contexts: SupermemoryContext[] = [];

    for (const result of results.results) {
      // Skip current document
      if (result.documentId === currentDocumentId) {
        continue;
      }

      // Add each relevant chunk as context
      if (result.chunks && result.chunks.length > 0) {
        const relevantChunk = result.chunks[0]; // Take most relevant chunk
        
        contexts.push({
          content: relevantChunk.content || '',
          source: result.title || 'Untitled Document',
          relevance: result.score || 0,
          documentId: result.documentId
        });
      }

      // Stop if we have enough context
      if (contexts.length >= limit) {
        break;
      }
    }

    return contexts;

  } catch (error) {
    console.error('Failed to get AI context from Supermemory:', error);
    return [];
  }
}

/**
 * Fallback basic text search using PostgreSQL
 * Used when Supermemory is disabled or fails
 * 
 * @param query - Search query
 * @param userId - User ID
 * @returns Array of matching documents
 */
async function basicTextSearch(
  query: string,
  userId: string
): Promise<EnhancedSearchResult[]> {
  try {
    // Note: This is a simplified version without full-text search ranking
    // For production, you might want to use raw SQL for complex full-text search
    const result = await db
      .select({
        id: documents.id,
        title: documents.title,
        contentText: documents.contentText,
        wordCount: documents.wordCount,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(and(
        eq(documents.userId, userId),
        eq(documents.isArchived, false)
      ))
      .orderBy(documents.updatedAt)
      .limit(10);

    return result.map(doc => ({
      documentId: doc.id,
      title: doc.title,
      score: 1.0, // Simplified scoring
      matchedChunks: [{
        content: doc.contentText?.substring(0, 200) || '',
        score: 1.0,
        isRelevant: true
      }],
      contentText: doc.contentText || undefined,
      wordCount: doc.wordCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));

  } catch (error) {
    console.error('Basic text search failed:', error);
    return [];
  }
}

/**
 * Advanced search with multiple container tags
 * Allows searching across different tag categories for more comprehensive results
 * 
 * @param query - Search query
 * @param userId - User ID
 * @param containerTags - Array of container tags to search within
 * @param options - Additional search options
 * @returns Array of enhanced search results
 */
export async function searchWithMultipleTags(
  query: string,
  userId: string,
  containerTags: string[],
  options: SearchOptions = {}
): Promise<EnhancedSearchResult[]> {
  if (!isSupermemoryEnabled()) {
    console.log('Supermemory search disabled, falling back to basic search');
    return basicTextSearch(query, userId);
  }

  const {
    limit = 10,
    chunkThreshold = 0.6,
    rerank = true,
    rewriteQuery = true,
    onlyMatchingChunks = false,
  } = options;

  try {
    // Search across multiple container tags
    const results = await supermemoryClient.search.documents({
      q: query,
      containerTags: containerTags,
      limit: limit,
      chunkThreshold: chunkThreshold,
      rerank: rerank,
      rewriteQuery: rewriteQuery,
      onlyMatchingChunks: onlyMatchingChunks,
      filters: {
        AND: [
          { key: "userId", value: userId, negate: false },
          { key: "isArchived", value: "true", negate: true }
        ]
      }
    });

    // Extract document IDs from Supermemory results
    const documentIds = results.results
      .map(r => r.documentId)
      .filter((id): id is string => id !== undefined && id !== null);

    if (documentIds.length === 0) {
      return [];
    }

    // Fetch full document data from Supabase using Drizzle
    const documentsResult = await db
      .select({
        id: documents.id,
        title: documents.title,
        contentText: documents.contentText,
        wordCount: documents.wordCount,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(and(
        inArray(documents.id, documentIds),
        eq(documents.userId, userId)
      ));

    const documentsMap = new Map(
      documentsResult.map(doc => [doc.id, doc])
    );

    // Combine Supermemory results with Supabase data
    const enhancedResults: EnhancedSearchResult[] = results.results.map(result => {
      const doc = documentsMap.get(result.documentId || '');
      
      return {
        documentId: result.documentId || '',
        title: doc?.title || result.title || 'Untitled',
        score: result.score || 0,
        matchedChunks: (result.chunks || []).map(chunk => ({
          content: chunk.content || '',
          score: chunk.score || 0,
          isRelevant: chunk.isRelevant ?? true
        })),
        contentText: doc?.contentText || undefined,
        wordCount: doc?.wordCount,
        createdAt: doc?.createdAt,
        updatedAt: doc?.updatedAt
      };
    });

    return enhancedResults;

  } catch (error) {
    console.error('Supermemory multi-tag search failed:', error);
    // Fallback to basic text search
    return basicTextSearch(query, userId);
  }
}

/**
 * Get related documents based on current document content
 * Shows "You might also be interested in..." suggestions
 * 
 * @param documentId - Current document ID
 * @param userId - User ID
 * @param limit - Maximum number of related documents
 * @returns Array of related documents
 */
export async function getRelatedDocuments(
  documentId: string,
  userId: string,
  limit: number = 5
): Promise<EnhancedSearchResult[]> {
  if (!isSupermemoryEnabled()) {
    return [];
  }

  try {
    // Get current document using Drizzle
    const docResult = await db
      .select({
        contentText: documents.contentText,
      })
      .from(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.userId, userId)
      ))
      .limit(1);

    if (docResult.length === 0) {
      return [];
    }

    const contentText = docResult[0].contentText || '';
    
    // Use last 500 characters as query (what they're currently writing about)
    const query = contentText.slice(-500);

    // Search for related documents
    return searchDocuments(query, userId, {
      limit: limit + 1, // +1 because we'll filter out current doc
      chunkThreshold: 0.75,
      rerank: true,
      rewriteQuery: false // Don't rewrite for "more like this" queries
    }).then(results => 
      results
        .filter(r => r.documentId !== documentId) // Exclude current document
        .slice(0, limit)
    );

  } catch (error) {
    console.error('Failed to get related documents:', error);
    return [];
  }
}

