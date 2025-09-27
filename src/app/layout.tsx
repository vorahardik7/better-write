import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SessionProvider } from "next-auth/react"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "BetterWrite - AI-Powered Document Editor",
  description: "The next-generation document editor that understands your intent. Write with AI magic.",
  keywords: ["AI", "document editor", "writing", "text editor", "artificial intelligence"],
  authors: [{ name: "BetterWrite Team" }],
  openGraph: {
    title: "BetterWrite - AI-Powered Document Editor",
    description: "Write with AI magic. Select text, describe what you want, and watch AI transform your ideas instantly.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterWrite - AI-Powered Document Editor",
    description: "Write with AI magic. The future of document editing is here.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} scroll-smooth`}>
      <body className={`antialiased`}>
        <SessionProvider>
          <Analytics />
          <SpeedInsights />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
