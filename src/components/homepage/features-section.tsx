'use client';

import { motion } from 'motion/react';

import { SectionHeader } from './section-header';

const featureCards = [
  {
    id: 'library',
    eyebrow: 'Workspace',
    title: 'Document library built for teams',
    description:
      'All docs, starred work, recent edits, shared links, and archive live together—no more hunting through folders or separate tools.',
    gradient: 'from-[#ffe1f1] via-[#fff4fa] to-white',
    accent: 'bg-[#2563eb]',
    mediaTone: 'bg-[#fdf2ff]',
    size: 'sm:col-span-2 lg:col-span-5 lg:row-span-2',
  },
  {
    id: 'palette',
    eyebrow: 'Command palette',
    title: 'Ask ⌘K to rewrite, structure, or summarize',
    description:
      'Highlight any section, press ⌘K, and better-write rewrites, expands, compresses, or shifts tone while respecting your document voice.',
    gradient: 'from-[#ede9fe] via-[#f5f3ff] to-white',
    accent: 'bg-[#7c3aed]',
    mediaTone: 'bg-[#f4f0ff]',
    size: 'sm:col-span-1 lg:col-span-3 lg:row-span-2',
  },
  {
    id: 'memory',
    eyebrow: 'Smart memory',
    title: 'Intelligent document understanding',
    description:
      'AI that understands context, tone, and your domain knowledge to provide better writing suggestions and improvements.',
    gradient: 'from-[#dcfce7] via-[#f0fdf4] to-white',
    accent: 'bg-[#059669]',
    mediaTone: 'bg-[#ecfdf5]',
    size: 'sm:col-span-1 lg:col-span-3 lg:row-span-2',
  },
  {
    id: 'versions',
    eyebrow: 'Control',
    title: 'Versioned',
    description:
      'Every change is captured. Branch ideas, compare revisions, and roll back instantly when experiments don’t land.',
    gradient: 'from-[#fee2e2] via-[#fff7ed] to-white',
    accent: 'bg-[#f97316]',
    mediaTone: 'bg-[#fff4ed]',
    size: 'sm:col-span-1 lg:col-span-2 lg:row-span-2',
  },
  {
    id: 'handoff',
    eyebrow: 'Workflows',
    title: 'Exports and handoff built in',
    description:
      'Publish to PDF, Markdown, or Word and sync action items into your roadmap so docs and delivery stay aligned.',
    gradient: 'from-[#fef3c7] via-white to-[#ecfdf5]',
    accent: 'bg-[#d97706]',
    mediaTone: 'bg-[#fef3c7]',
    size: 'sm:col-span-1 lg:col-span-3 lg:row-span-2',
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-br from-[#fff0f6] via-[#fff7fb] to-white"
    >
      <div className="pointer-events-none motion-smooth absolute inset-0" aria-hidden>
        <div className="absolute -top-24 left-[8%] h-64 w-64 rounded-full bg-gradient-to-br from-[#ffdff0] via-transparent to-transparent opacity-70 blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute right-[20%] top-[30%] h-72 w-72 rounded-full bg-gradient-to-br from-[#ffe6f5] via-white to-transparent opacity-65 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[28%] h-80 w-80 rounded-full bg-gradient-to-br from-[#ffd4ed] via-white to-transparent opacity-60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader sectionId="features" label="Features" order={1}>
          Features
        </SectionHeader>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-10 max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl leading-tight text-slate-900 sm:text-4xl md:text-[44px]">
            Replace scattered docs with one coordinated workspace.
          </h2>
          <p className="mt-5 text-base text-slate-600 sm:text-lg">
            Better-write supports kickoff, collaboration, and delivery in one place. AI accelerates the work; your team keeps control over process and approvals.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-8 lg:auto-rows-[120px]">
          {featureCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className={`relative overflow-hidden rounded-[32px] border border-white/50 bg-white/80 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur ${card.size}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`} aria-hidden />
              <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${card.accent}`} />
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-slate-500 sm:text-xs">
                      {card.eyebrow}
                    </p>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 sm:text-[22px]">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{card.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}