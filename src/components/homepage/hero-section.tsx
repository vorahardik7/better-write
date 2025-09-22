'use client';

import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-pattern overflow-hidden pb-8">
      {/* Background Animation */}
      <div className="absolute inset-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-black shadow-[3px_3px_0_#000] cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800">BetterWrite</span>
          </motion.div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
        >
          Write with
          <span className="text-blue-700"> AI Assistance</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          The smarter alternative to Word. Create documents faster with AI that understands your content. 
          Write, edit, format, and chat with your document - all in one place.
        </motion.p>


        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-6"
        >
          <Link href="/editor">
            <motion.button 
              className="bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_#000] px-8 py-4 font-bold text-black hover:shadow-[8px_8px_0_#000] transition-all duration-200 min-w-[280px] cursor-pointer"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <div className="flex items-center gap-2 justify-center">
                Try BetterWrite
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </div>
            </motion.button>
          </Link>

          <motion.button 
            className="bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_#000] px-8 py-4 font-bold text-black hover:shadow-[8px_8px_0_#000] transition-all duration-200 min-w-[300px] cursor-pointer"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            aria-label="Continue with Google"
          >
            <div className="flex items-center gap-2 justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303C33.602,32.091,29.28,35,24,35c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.869,4.067,29.7,2,24,2C12.955,2,4,10.955,4,22s8.955,20,20,20 s20-8.955,20-20C44,21.341,43.862,20.692,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.869,4.067,29.7,2,24,2C15.316,2,7.828,6.99,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,42c5.209,0,9.899-1.992,13.432-5.234l-6.19-5.238C29.211,32.091,25.564,33,24,33 c-5.244,0-9.652-3.355-11.281-8.002l-6.59,5.077C8.608,37.626,15.707,42,24,42z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-1.086,3.091-3.27,5.091-6.061,6.529l6.19,5.238 C36.955,39.297,44,35,44,22C44,21.341,43.862,20.692,43.611,20.083z"/>
              </svg>
              Continue with Google
            </div>
          </motion.button>
        </motion.div>

        {/* Demo Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-sm text-gray-500 mt-6"
        >
          No sign-up required • Start writing immediately
        </motion.p>
      </div>
    </section>
  );
} 