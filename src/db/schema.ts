import { 
  pgTable, 
  text, 
  boolean, 
  integer, 
  jsonb, 
  timestamp, 
  primaryKey,
  index,
  serial
} from 'drizzle-orm/pg-core';

// User table (Better Auth)
export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

// Session table (Better Auth)
export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

// Account table (Better Auth)
export const accounts = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
});

// Verification table (Better Auth)
export const verifications = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

// Documents table
export const documents = pgTable('document', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: jsonb('content').notNull(), // TipTap JSON content
  contentText: text('contentText'), // Plain text for search
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  supermemoryDocId: text('supermemoryDocId'), // Supermemory document ID
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  lastEditedAt: timestamp('lastEditedAt', { withTimezone: true }).defaultNow().notNull(),
  isArchived: boolean('isArchived').default(false).notNull(),
  isPublic: boolean('isPublic').default(false).notNull(),
  wordCount: integer('wordCount').default(0).notNull(),
  characterCount: integer('characterCount').default(0).notNull(),
}, (table) => [
  index('document_user_id_idx').on(table.userId),
  index('document_updated_at_idx').on(table.updatedAt),
  index('document_created_at_idx').on(table.createdAt),
]);

// Document versions for history/autosave
export const documentVersions = pgTable('document_version', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  content: jsonb('content').notNull(),
  contentText: text('contentText'),
  wordCount: integer('wordCount').default(0).notNull(),
  characterCount: integer('characterCount').default(0).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  isAutosave: boolean('isAutosave').default(false).notNull(),
  changeDescription: text('changeDescription'),
}, (table) => [
  index('document_version_document_id_idx').on(table.documentId),
  index('document_version_created_at_idx').on(table.createdAt),
]);

// Document sharing/collaboration
export const documentShares = pgTable('document_share', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  sharedBy: text('sharedBy').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sharedWith: text('sharedWith').references(() => users.id, { onDelete: 'cascade' }),
  shareToken: text('shareToken').unique(),
  permissions: text('permissions').notNull().default('read'), // 'read', 'write', 'admin'
  expiresAt: timestamp('expiresAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean('isActive').default(true).notNull(),
}, (table) => [
  index('document_share_document_id_idx').on(table.documentId),
  index('document_share_token_idx').on(table.shareToken),
]);

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type NewDocumentVersion = typeof documentVersions.$inferInsert;

export type DocumentShare = typeof documentShares.$inferSelect;
export type NewDocumentShare = typeof documentShares.$inferInsert;
