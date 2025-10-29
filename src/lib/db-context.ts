/**
 * Database context utilities for Better Auth RLS
 */

import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Set user context for RLS policies
 * This must be called before any database operations that need RLS
 * @param userId - The user ID to set as context
 */
export async function setUserContext(userId: string): Promise<void> {
  await db.execute(sql`SELECT set_user_context(${userId})`);
}

/**
 * Clear user context
 * Call this after database operations are complete
 */
export async function clearUserContext(): Promise<void> {
  await db.execute(sql`SELECT clear_user_context()`);
}

/**
 * Execute a database operation with user context
 * This ensures RLS policies work correctly
 * @param userId - The user ID
 * @param operation - The database operation to execute
 * @returns The result of the operation
 */
export async function withUserContext<T>(
  userId: string,
  operation: () => Promise<T>
): Promise<T> {
  try {
    await setUserContext(userId);
    return await operation();
  } finally {
    await clearUserContext();
  }
}

/**
 * Check if user is authenticated in the current context
 * @returns True if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const result = await db.execute(sql`SELECT is_authenticated() as authenticated`);
  return result[0]?.authenticated as boolean || false;
}

/**
 * Get current user ID from context
 * @returns The current user ID or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const result = await db.execute(sql`SELECT get_current_user_id() as user_id`);
  return result[0]?.user_id as string | null || null;
}
