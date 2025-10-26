import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

// Create PostgreSQL connection pool for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { 
      rejectUnauthorized: true, 
      ca: process.env.DATABASE_CA_CERT, 
      } 
    : { rejectUnauthorized: false }, 
});

export const auth = betterAuth({
  database: pool, 
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  baseURL: process.env.BETTER_AUTH_URL as string,
  plugins: [nextCookies()],
});