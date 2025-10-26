'use client';

import { motion } from 'motion/react';

import { SectionHeader } from './section-header';

const featureCards = [
  {
    id: 'library',
    eyebrow: 'Workspace',
    title: 'Document library built for productivity',
    description:
      'All docs, starred work, recent edits, shared links, and archive live together—no more hunting through folders or separate tools.',
    accent: '#88994f',
    background: 'rgba(254, 250, 224, 0.95)',
    border: 'rgba(136, 153, 79, 0.18)',
    shadow: 'rgba(204, 213, 174, 0.35)',
    size: 'sm:col-span-2 lg:col-span-5 lg:row-span-2',
  },
  {
    id: 'palette',
    eyebrow: 'Command palette',
    title: 'Ask ⌘K to rewrite, structure, or summarize',
    description:
      'Highlight any section, press ⌘K, and better-write rewrites, expands, compresses, or shifts tone while respecting your document voice.',
    accent: '#88994f',
    background: 'rgba(254, 250, 224, 0.95)',
    border: 'rgba(136, 153, 79, 0.18)',
    shadow: 'rgba(204, 213, 174, 0.35)',
    size: 'sm:col-span-1 lg:col-span-3 lg:row-span-2',
  },
  {
    id: 'memory',
    eyebrow: 'Smart memory',
    title: 'Intelligent document understanding',
    description:
      'AI that understands context, tone, and your domain knowledge to provide better writing suggestions and improvements.',
    accent: '#88994f',
    background: 'rgba(254, 250, 224, 0.95)',
    border: 'rgba(136, 153, 79, 0.18)',
    shadow: 'rgba(204, 213, 174, 0.35)',
    size: 'sm:col-span-1 lg:col-span-3 lg:row-span-2',
  },
  {
    id: 'versions',
    eyebrow: 'Control',
    title: 'Versioned',
    description:
      'Every change is captured. Branch ideas, compare revisions, and roll back instantly when experiments don\'t land.',
    accent: '#88994f',
    background: 'rgba(254, 250, 224, 0.95)',
    border: 'rgba(136, 153, 79, 0.18)',
    shadow: 'rgba(204, 213, 174, 0.35)',
    size: 'sm:col-span-1 lg:col-span-2 lg:row-span-2',
  },
  {
    id: 'handoff',
    eyebrow: 'Workflows',
    title: 'Exports and handoff built in',
    description:
      'Publish to PDF, Markdown, or Word and sync action items into your roadmap so docs and delivery stay aligned.',
    accent: '#88994f',
    background: 'rgba(254, 250, 224, 0.95)',
    border: 'rgba(136, 153, 79, 0.18)',
    shadow: 'rgba(204, 213, 174, 0.35)',
    size: 'sm:col-span-1 lg:col-span-3 lg:row-span-2',
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <div className="pointer-events-none motion-smooth absolute inset-0" aria-hidden>
        
        <div className="absolute right-[20%] top-[30%] h-72 w-72 rounded-full bg-[rgba(250,237,205,0.4)] opacity-55 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[28%] h-80 w-80 rounded-full bg-[rgba(233,237,201,0.4)] opacity-50 blur-3xl" />
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
            Better-write supports planning, writing, and delivery in one place. AI accelerates the work; you keep control over process and quality.
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
              className={`relative overflow-hidden rounded-[32px] p-7 backdrop-blur-sm ${card.size}`}
              style={{
                border: `1px solid ${card.border}`,
                background: card.background,
                boxShadow: `0 24px 70px ${card.shadow}`,
              }}
            >
              <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: card.accent }} />
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