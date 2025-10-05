import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Create PostgreSQL connection pool for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

export const auth = betterAuth({
  database: pool, // Use PostgreSQL pool as database instance
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  baseURL: process.env.BETTER_AUTH_URL as string,
});