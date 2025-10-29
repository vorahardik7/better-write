import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

// Create PostgreSQL connection pool for Better Auth
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

export const auth = betterAuth({
  database: pool, 
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'none',
        },
      },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL as string,
  plugins: [nextCookies()],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session-token",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL as string,
    process.env.NEXT_PUBLIC_APP_URL as string,
  ].filter(Boolean),
});