import { db, documents, users } from './db';
import { eq, and, desc, sql } from 'drizzle-orm';

// Prepared statements for better performance
export const preparedStatements = {
  // Get user's documents with pagination
  getUserDocuments: db
    .select({
      id: documents.id,
      title: documents.title,
      contentText: documents.contentText,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      lastEditedAt: documents.lastEditedAt,
      isArchived: documents.isArchived,
      isPublic: documents.isPublic,
      wordCount: documents.wordCount,
      characterCount: documents.characterCount,
    })
    .from(documents)
    .where(and(
      eq(documents.userId, sql.placeholder('userId')),
      eq(documents.isArchived, false)
    ))
    .orderBy(desc(documents.updatedAt))
    .limit(sql.placeholder('limit'))
    .offset(sql.placeholder('offset'))
    .prepare('getUserDocuments'),

  // Get document by ID and user
  getDocumentById: db
    .select()
    .from(documents)
    .where(and(
      eq(documents.id, sql.placeholder('documentId')),
      eq(documents.userId, sql.placeholder('userId'))
    ))
    .limit(1)
    .prepare('getDocumentById'),

  // Count user's documents
  countUserDocuments: db
    .select({ total: sql<number>`count(*)` })
    .from(documents)
    .where(and(
      eq(documents.userId, sql.placeholder('userId')),
      eq(documents.isArchived, false)
    ))
    .prepare('countUserDocuments'),

  // Archive document
  archiveDocument: db
    .update(documents)
    .set({
      isArchived: true,
    })
    .where(and(
      eq(documents.id, sql.placeholder('documentId')),
      eq(documents.userId, sql.placeholder('userId'))
    ))
    .returning({ id: documents.id })
    .prepare('archiveDocument'),
};

// Helper functions for updates that can't use prepared statements with placeholders
export const documentHelpers = {
  // Update document with dynamic values
  async updateDocument(
    documentId: string,
    userId: string,
    updates: {
      title?: string;
      content?: any;
      contentText?: string;
      wordCount?: number;
      characterCount?: number;
      updatedAt?: Date;
      lastEditedAt?: Date;
    }
  ) {
    return await db
      .update(documents)
      .set(updates)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.userId, userId)
      ))
      .returning();
  },

  // Delete document
  async deleteDocument(documentId: string, userId: string) {
    return await db
      .delete(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.userId, userId)
      ))
      .returning({ id: documents.id });
  }
};

// Example usage:
// const documents = await preparedStatements.getUserDocuments.execute({
//   userId: 'user-123',
//   limit: 10,
//   offset: 0
// });