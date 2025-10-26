import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

// Create postgres connection
const client = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.NODE_ENV === 'production' 
    ? { 
        rejectUnauthorized: false, // Allow self-signed certs in production for Supabase
        // Remove ca requirement for Supabase compatibility
      } 
    : { rejectUnauthorized: false }, // Allow self-signed certs in development
});

// Create Drizzle instance
export const db = drizzle({ client, schema });

// Export schema for use in other files
export * from '../db/schema';

