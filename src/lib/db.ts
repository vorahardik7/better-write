import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

/**
 * Create postgres connection for Supabase
 * 
 * RLS policies are configured directly in Supabase dashboard.
 * The application still needs to pass the authenticated user context.
 */
function createConnection() {
  const connectionString = process.env.DATABASE_URL!;
  
  const sslConfig = process.env.NODE_ENV === 'production' 
    ? { 
        rejectUnauthorized: true, // CRITICAL: Enable SSL validation in production
        ca: process.env.DATABASE_CA_CERT, // Provide CA cert for validation
      } 
    : { rejectUnauthorized: false }; // Allow self-signed certs in development only

  return postgres(connectionString, {
    ssl: sslConfig,
    connection: {
      application_name: 'flow-write-ai'
    }
  });
}

// Create Drizzle instance
export const db = drizzle({ 
  client: createConnection(), 
  schema 
});

// Export schema for use in other files
export * from '../db/schema';

