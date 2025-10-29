/**
 * User limits service for enforcing quotas and limits
 */

import { db, userLimits, documents } from './db';
import { eq, and, sql } from 'drizzle-orm';
import { calculateContentMetrics, validateContentLimits } from './content-utils';

export interface UserLimitCheck {
  canCreateDocument: boolean;
  canUpdateDocument: boolean;
  currentDocumentCount: number;
  maxDocuments: number;
  totalStorageUsed: number;
  maxStoragePerDocument: number;
  maxPagesPerDocument: number;
  errors: string[];
}

/**
 * Get user limits and current usage
 * @param userId - The user ID
 * @returns User limits and current usage
 */
export async function getUserLimits(userId: string) {
  const limits = await db
    .select()
    .from(userLimits)
    .where(eq(userLimits.userId, userId))
    .limit(1);

  if (limits.length === 0) {
    // Create default limits if none exist
    const defaultLimits = {
      id: `limit_${userId}`,
      userId,
      maxDocuments: 10,
      maxDocumentSizeBytes: 1048576, // 1MB
      maxDocumentPages: 10,
      currentDocumentCount: 0,
      totalStorageUsedBytes: 0,
    };

    await db.insert(userLimits).values(defaultLimits);
    return defaultLimits;
  }

  return limits[0];
}

/**
 * Check if user can create a new document
 * @param userId - The user ID
 * @param content - The document content to validate
 * @returns Validation result
 */
export async function checkDocumentCreationLimits(
  userId: string,
  content: any
): Promise<UserLimitCheck> {
  const limits = await getUserLimits(userId);
  const metrics = calculateContentMetrics(content);
  
  const canCreateDocument = limits.currentDocumentCount < limits.maxDocuments;
  const contentValidation = validateContentLimits(
    content,
    limits.maxDocumentSizeBytes,
    limits.maxDocumentPages
  );

  const errors: string[] = [];
  
  if (!canCreateDocument) {
    errors.push(`Document limit reached (${limits.currentDocumentCount}/${limits.maxDocuments})`);
  }
  
  if (!contentValidation.isValid) {
    errors.push(...contentValidation.errors);
  }

  return {
    canCreateDocument: canCreateDocument && contentValidation.isValid,
    canUpdateDocument: contentValidation.isValid,
    currentDocumentCount: limits.currentDocumentCount,
    maxDocuments: limits.maxDocuments,
    totalStorageUsed: limits.totalStorageUsedBytes,
    maxStoragePerDocument: limits.maxDocumentSizeBytes,
    maxPagesPerDocument: limits.maxDocumentPages,
    errors,
  };
}

/**
 * Check if user can update a document
 * @param userId - The user ID
 * @param content - The new document content
 * @param documentId - The document ID being updated
 * @returns Validation result
 */
export async function checkDocumentUpdateLimits(
  userId: string,
  content: any,
  documentId: string
): Promise<UserLimitCheck> {
  const limits = await getUserLimits(userId);
  
  // Get current document to calculate size difference
  const currentDoc = await db
    .select({
      contentSizeBytes: documents.contentSizeBytes,
    })
    .from(documents)
    .where(and(
      eq(documents.id, documentId),
      eq(documents.userId, userId)
    ))
    .limit(1);

  const currentSize = currentDoc[0]?.contentSizeBytes || 0;
  const metrics = calculateContentMetrics(content);
  const sizeDifference = metrics.contentSizeBytes - currentSize;
  
  const contentValidation = validateContentLimits(
    content,
    limits.maxDocumentSizeBytes,
    limits.maxDocumentPages
  );

  const errors: string[] = [];
  
  if (!contentValidation.isValid) {
    errors.push(...contentValidation.errors);
  }

  return {
    canCreateDocument: false, // Not creating, just updating
    canUpdateDocument: contentValidation.isValid,
    currentDocumentCount: limits.currentDocumentCount,
    maxDocuments: limits.maxDocuments,
    totalStorageUsed: limits.totalStorageUsedBytes,
    maxStoragePerDocument: limits.maxDocumentSizeBytes,
    maxPagesPerDocument: limits.maxDocumentPages,
    errors,
  };
}

/**
 * Update user limits after document creation
 * @param userId - The user ID
 * @param contentSizeBytes - Size of the new document
 */
export async function updateLimitsAfterDocumentCreation(
  userId: string,
  contentSizeBytes: number
) {
  await db
    .update(userLimits)
    .set({
      currentDocumentCount: sql`${userLimits.currentDocumentCount} + 1`,
      totalStorageUsedBytes: sql`${userLimits.totalStorageUsedBytes} + ${contentSizeBytes}`,
      updatedAt: new Date(),
    })
    .where(eq(userLimits.userId, userId));
}

/**
 * Update user limits after document update
 * @param userId - The user ID
 * @param oldSizeBytes - Previous size of the document
 * @param newSizeBytes - New size of the document
 */
export async function updateLimitsAfterDocumentUpdate(
  userId: string,
  oldSizeBytes: number,
  newSizeBytes: number
) {
  const sizeDifference = newSizeBytes - oldSizeBytes;
  
  if (sizeDifference !== 0) {
    await db
      .update(userLimits)
      .set({
        totalStorageUsedBytes: sql`${userLimits.totalStorageUsedBytes} + ${sizeDifference}`,
        updatedAt: new Date(),
      })
      .where(eq(userLimits.userId, userId));
  }
}

/**
 * Update user limits after document deletion
 * @param userId - The user ID
 * @param contentSizeBytes - Size of the deleted document
 */
export async function updateLimitsAfterDocumentDeletion(
  userId: string,
  contentSizeBytes: number
) {
  await db
    .update(userLimits)
    .set({
      currentDocumentCount: sql`GREATEST(0, ${userLimits.currentDocumentCount} - 1)`,
      totalStorageUsedBytes: sql`GREATEST(0, ${userLimits.totalStorageUsedBytes} - ${contentSizeBytes})`,
      updatedAt: new Date(),
    })
    .where(eq(userLimits.userId, userId));
}

/**
 * Get user's document usage statistics
 * @param userId - The user ID
 * @returns Usage statistics
 */
export async function getUserUsageStats(userId: string) {
  const limits = await getUserLimits(userId);
  
  // Get additional stats from documents
  const docStats = await db
    .select({
      totalDocuments: sql<number>`count(*)`,
      totalStorage: sql<number>`sum(${documents.contentSizeBytes})`,
      averageSize: sql<number>`avg(${documents.contentSizeBytes})`,
    })
    .from(documents)
    .where(and(
      eq(documents.userId, userId),
      eq(documents.isArchived, false)
    ));

  const stats = docStats[0] || {
    totalDocuments: 0,
    totalStorage: 0,
    averageSize: 0,
  };

  return {
    ...limits,
    usage: {
      documentCount: stats.totalDocuments,
      storageUsed: stats.totalStorage || 0,
      averageDocumentSize: stats.averageSize || 0,
      documentLimitRemaining: limits.maxDocuments - limits.currentDocumentCount,
      storageLimitRemaining: limits.maxDocumentSizeBytes,
    },
  };
}
