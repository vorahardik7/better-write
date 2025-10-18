"use client";

import { useState } from "react";

import { signIn } from "@/lib/auth-client";
import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";


export function HeroSection() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch (error) {
      console.error("Failed to sign in with Google", error);
      setIsSigningIn(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pb-28 pt-36 sm:pb-32 sm:pt-40 bg-[#fff7fb]">
      <div className="pointer-events-none absolute inset-0 motion-smooth" aria-hidden>
        <div className="absolute left-1/2 top-[-32%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#d7f0ff] via-[#edf2ff] to-[#f9e8ff] opacity-75 blur-3xl sm:h-[680px] sm:w-[680px]" />
        <div className="absolute -bottom-16 left-[12%] h-72 w-72 rounded-full bg-gradient-to-br from-[#e6f9ff] via-[#def7ef] to-transparent opacity-65 blur-2xl" />
        <div className="absolute -right-24 top-[35%] hidden h-80 w-80 rounded-full bg-gradient-to-br from-[#f1e6ff] via-white to-transparent opacity-65 blur-2xl md:block" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 text-center sm:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full"
        >

          <h1 className="font-display text-[2.9rem] leading-[1.05] text-slate-900 sm:text-[3.6rem] md:text-[4.3rem]">
          Introducing <span className="italic lowercase tracking-tight">better-write</span>
          </h1>

          <br/>
          
          <h3 className="text-lg leading-relaxed text-slate-600 sm:text-xl">AI-powered writing workflow that lives inside your document.</h3>


          <p className="mt-6 mx-auto max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Highlight a sentence, press ⌘K, and better-write rewrites, summarizes, or expands using the context it already understands. No copy/paste, no lost tone, no juggling tools.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="cursor-pointer group inline-flex items-center gap-3 rounded-full bg-slate-900 px-7 py-4 text-sm font-semibold text-white transition hover:bg-black disabled:pointer-events-none disabled:opacity-70"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in
                </>
              ) : (
                <>
                  Continue with Google
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

          </div>

        </motion.div>
      </div>
    </section>
  );
}
