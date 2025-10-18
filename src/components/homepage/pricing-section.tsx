'use client';

import { motion } from 'motion/react';

import { SectionHeader } from './section-header';
import { signIn } from '@/lib/auth-client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function PricingSection() {

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
    <section
      id="pricing"
      className="relative overflow-hidden py-24 sm:py-28"
    >
      <div className="pointer-events-none motion-smooth absolute inset-0" aria-hidden>
        <div className="absolute right-[12%] top-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-[#ccd5ae] via-[#fefae0] to-transparent opacity-55 blur-3xl" />
        <div className="absolute left-[15%] bottom-[-18%] h-80 w-80 rounded-full bg-gradient-to-br from-[#d4a373] via-[#faedcd] to-transparent opacity-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader sectionId="pricing" label="Pricing" order={3}>
          Pricing
        </SectionHeader>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-10 max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl leading-[1.1] text-slate-900 sm:text-4xl md:text-[44px]">
            Free until I figure out how to make money.
          </h2>
          <p className="mt-5 text-base text-slate-600 sm:text-lg">
            Early access includes unlimited documents, AI command palette, and advanced features while we tune automations with early users.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-16 max-w-xl"
        >
          <div className="relative overflow-hidden rounded-[32px] border border-white/50 bg-[#fefae0]/85 p-8 shadow-[0_28px_72px_rgba(212,163,115,0.2)] backdrop-blur sm:p-10">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-[#ccd5ae] via-[#e9edc9] to-transparent opacity-60 blur-3xl" />
            <div className="flex flex-col gap-6 text-left sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#88994f] sm:text-xs">Early Access</p>
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="text-4xl font-semibold text-slate-900 sm:text-5xl">Free</span>
                  <span className="text-sm font-medium text-[#88994f] sm:text-base">for now</span>
                </div>
              </div>
              
            </div>

            <p className="mt-6 text-sm leading-relaxed text-slate-600">
              Start your focused writing workflow today. When we launch paid plans you keep your history.
            </p>

            <ul className="mt-7 space-y-3 text-sm font-medium text-slate-700">
              {[
                'Unlimited documents & workspaces',
                'AI command palette (rewrite, summarize, plan)',
                'Secure storage with access controls',
                'PDF, Markdown, and Word export',
                'Priority input on automation roadmap',
              ].map((highlight) => (
                <li key={highlight} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/50 bg-[#fefae0] text-xs font-semibold text-slate-900">
                    ✓
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#d4a373] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#c18f62]"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                     Signing in...
                  </>
                ) : (
                  <>
                    Join Now
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


