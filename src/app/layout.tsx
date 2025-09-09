import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VibeDoc - AI-Powered Document Editor",
  description: "The next-generation document editor that understands your intent. Write with AI magic.",
  keywords: ["AI", "document editor", "writing", "text editor", "artificial intelligence"],
  authors: [{ name: "VibeDoc Team" }],
  openGraph: {
    title: "VibeDoc - AI-Powered Document Editor",
    description: "Write with AI magic. Select text, describe what you want, and watch AI transform your ideas instantly.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeDoc - AI-Powered Document Editor",
    description: "Write with AI magic. The future of document editing is here.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
