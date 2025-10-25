import { createHash } from 'crypto';
import { supermemoryClient, isSupermemoryEnabled, getUserContainerTag } from './client';
import { db, documents } from '../db';
import { eq, and } from 'drizzle-orm';
import type { SyncResult, SyncOptions, SupermemoryDocumentMetadata } from './types';

/**
 * Sync a document to Supermemory knowledge graph
 * Uses customId for idempotent upserts - same document ID updates existing memory
 * 
 * @param documentId - The Supabase document ID
 * @param userId - The user ID who owns the document
 * @param options - Optional sync configuration
 * @returns SyncResult with success status and Supermemory document ID
 */
export async function syncDocumentToSupermemory(
  documentId: string,
  userId: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  // Check if Supermemory is enabled
  if (!isSupermemoryEnabled()) {
    console.log('Supermemory sync skipped: feature not enabled');
    return { success: true, skipped: true, reason: 'feature-disabled' };
  }

  const {
    force = false,
    skipIfArchived = true,
    minWordCount = 0,
  } = options;

  try {
    // 1. Fetch document from database
    const result = await db
      .select({
        id: documents.id,
        title: documents.title,
        contentText: documents.contentText,
        wordCount: documents.wordCount,
        characterCount: documents.characterCount,
        createdAt: documents.createdAt,
        lastEditedAt: documents.lastEditedAt,
        isArchived: documents.isArchived,
        supermemoryDocId: documents.supermemoryDocId,
      })
      .from(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.userId, userId)
      ))
      .limit(1);

    if (result.length === 0) {
      return { 
        success: false, 
        error: 'Document not found' 
      };
    }

    const doc = result[0];

    // 2. Skip if archived (unless explicitly allowed)
    if (skipIfArchived && doc.isArchived) {
      return { 
        success: true, 
        skipped: true, 
        reason: 'document-archived' 
      };
    }

    // 3. Skip if below minimum word count
    if (doc.wordCount < minWordCount) {
      return { 
        success: true, 
        skipped: true, 
        reason: 'word-count-too-low' 
      };
    }

    // 4. Check if content changed (optimize token usage)
    const contentText = doc.contentText || '';
    const contentHash = createHash('md5').update(contentText).digest('hex');

    // 5. Prepare document metadata
    const metadata: SupermemoryDocumentMetadata = {
      title: doc.title,
      userId: userId,
      wordCount: doc.wordCount,
      createdAt: doc.createdAt.toISOString(),
      lastEditedAt: doc.lastEditedAt.toISOString(),
      isArchived: doc.isArchived.toString(),
      documentType: 'betterwrite',
    };

    // 6. Sync to Supermemory
    const containerTag = getUserContainerTag(userId);
    const customId = `betterwrite-${doc.id}`;

    let supermemoryDocId: string;

    if (doc.supermemoryDocId) {
      // Update existing document
      const updateResult = await supermemoryClient.documents.update(doc.supermemoryDocId, {
        content: contentText,
        metadata: metadata as any,
        containerTag: containerTag,
      });

      supermemoryDocId = updateResult.id;
    } else {
      // Create new document
      const createResult = await supermemoryClient.documents.add({
        content: contentText,
        metadata: metadata as any,
        containerTag: containerTag,
        customId: customId,
      });

      supermemoryDocId = createResult.id;
    }

    // 7. Update database with Supermemory document ID
    await db
      .update(documents)
      .set({
        supermemoryDocId: supermemoryDocId,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    return {
      success: true,
      supermemoryDocId: supermemoryDocId,
      skipped: false,
    };

  } catch (error) {
    console.error('Supermemory sync failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync multiple documents to Supermemory
 * 
 * @param documentIds - Array of document IDs to sync
 * @param userId - The user ID who owns the documents
 * @param options - Optional sync configuration
 * @returns Array of sync results
 */
export async function syncMultipleDocumentsToSupermemory(
  documentIds: string[],
  userId: string,
  options: SyncOptions = {}
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  for (const documentId of documentIds) {
    try {
      const result = await syncDocumentToSupermemory(documentId, userId, options);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Remove document from Supermemory
 * 
 * @param documentId - The document ID to remove
 * @param userId - The user ID who owns the document
 * @returns SyncResult with success status
 */
export async function removeDocumentFromSupermemory(
  documentId: string,
  userId: string
): Promise<SyncResult> {
  if (!isSupermemoryEnabled()) {
    return { success: true, skipped: true, reason: 'feature-disabled' };
  }

  try {
    // Get document to find Supermemory ID
    const result = await db
      .select({
        supermemoryDocId: documents.supermemoryDocId,
      })
      .from(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.userId, userId)
      ))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: 'Document not found' };
    }

    const doc = result[0];

    if (doc.supermemoryDocId) {
      // Remove from Supermemory
      await supermemoryClient.documents.delete(doc.supermemoryDocId);
    }

    // Clear Supermemory ID from database
    await db
      .update(documents)
      .set({
        supermemoryDocId: null,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    return { success: true, skipped: false };

  } catch (error) {
    console.error('Supermemory removal failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}