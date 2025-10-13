'use client';

import { motion } from 'motion/react';

import { SectionHeader } from './section-header';

export function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <SectionHeader sectionId="pricing" label="Pricing" order={3}>
          Pricing
        </SectionHeader>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-8 max-w-3xl text-center sm:mt-10"
        >
          <h2 className="mt-6 text-3xl font-semibold leading-[1.08] text-slate-900 sm:mt-8 sm:text-4xl md:text-5xl">
            Start writing better documents today.
          </h2>
          <p className="mt-4 text-base font-medium text-slate-600 sm:text-lg">
            Writers, professionals, and teams rely on <span className="italic">better-write</span> to create polished, well-structured documents with AI assistance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-12 max-w-lg sm:mt-16"
        >
          <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-[#f5f4f0] to-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-xs">Free Plan</p>
                <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-4xl font-semibold text-slate-900 sm:text-5xl">Free</span>
                    <span className="text-lg font-medium text-slate-400 line-through sm:text-xl">$15/mo</span>
                </div>
              </div>
              <div className="inline-flex w-max items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
                Free Now
              </div>
            </div>
            <p className="mt-5 text-sm font-medium leading-relaxed text-slate-600">
              Everything you need to create professional documents with AI assistance built into your workflow.
            </p>
            <ul className="mt-6 space-y-2 text-sm font-medium text-slate-700">
              {[
                'Unlimited documents & workspaces',
                'AI outlining, rewriting, and summarization',
                'Smart formatting and version history',
                'Export to PDF, Markdown, and Word',
                'Real-time collaboration features',
                'Advanced AI writing suggestions',
              ].map((highlight) => (
                <li key={highlight} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-semibold text-slate-900">
                    ✓
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="/editor"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-slate-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-black"
              >
                Start now
              </a>
              <p className="text-xs font-medium text-slate-500">No credit card required • Start immediately</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


