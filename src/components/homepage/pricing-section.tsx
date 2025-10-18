'use client';

import { motion } from 'motion/react';

import { SectionHeader } from './section-header';

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-24 sm:py-28 bg-gradient-to-br from-[#fff0f6] via-[#fff7fb] to-white"
    >
      <div className="pointer-events-none motion-smooth absolute inset-0" aria-hidden>
        <div className="absolute right-[12%] top-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-[#ffdff0] via-transparent to-transparent opacity-68 blur-3xl" />
        <div className="absolute left-[15%] bottom-[-18%] h-80 w-80 rounded-full bg-gradient-to-br from-[#ffe9f7] via-white to-transparent opacity-72 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader sectionId="pricing" label="Access" order={3}>
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
            Your operational home is free while we co-build the roadmap.
          </h2>
          <p className="mt-5 text-base text-slate-600 sm:text-lg">
            Early access includes unlimited documents, AI command palette, and team sharing while we tune automations with founding teams.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-16 max-w-xl"
        >
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/85 p-8 shadow-[0_28px_72px_rgba(15,23,42,0.15)] backdrop-blur sm:p-10">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-[#bfdbfe] via-[#ede9fe] to-transparent opacity-70 blur-3xl" />
            <div className="flex flex-col gap-6 text-left sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-xs">Early Access</p>
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="text-4xl font-semibold text-slate-900 sm:text-5xl">Free</span>
                  <span className="text-sm font-medium text-slate-400 sm:text-base">for now</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Invite only
              </span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-slate-600">
              Bring your team into a focused workspace today. When we launch paid plans you keep your history, automations, and preferred founder pricing.
            </p>

            <ul className="mt-7 space-y-3 text-sm font-medium text-slate-700">
              {[
                'Unlimited documents & shared workspaces',
                'AI command palette (rewrite, summarize, plan)',
                'Secure storage with role-based permissions',
                'PDF, Markdown, and Word export',
                'Priority input on automation roadmap',
              ].map((highlight) => (
                <li key={highlight} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/60 bg-white text-xs font-semibold text-slate-900">
                    ✓
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="/editor"
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-black"
              >
                Claim your space
              </a>
              <p className="text-xs font-medium text-slate-500">No credit card • Export anytime</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


