import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import postgres from "postgres";

// Create PostgreSQL connection for Supabase (consistent with main db config)
const connection = postgres(process.env.DATABASE_URL!, {
  ssl: {
    rejectUnauthorized: false,
  }
});

export const auth = betterAuth({
  database: connection, 
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  baseURL: process.env.BETTER_AUTH_URL as string,
  plugins: [nextCookies()],
});