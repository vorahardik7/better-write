'use client';

import { motion } from 'motion/react';

import { SectionHeader } from './section-header';

const pillars = [
  {
    eyebrow: 'Structure',
    title: 'Outline complex documents instantly',
    description:
      'Generate structured outlines with one command so every section follows logical flow and organization.',
  },
  {
    eyebrow: 'Refine',
    title: 'Polish language to professional quality',
    description:
      'Transform rough drafts into clear, polished prose while preserving your voice and maintaining consistency.',
  },
  {
    eyebrow: 'Enhance',
    title: 'AI-powered writing assistance',
    description:
      'Get intelligent suggestions for improving clarity, tone, and structure as you write and revise your documents.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden bg-white py-24">
      <div className="relative mx-auto max-w-7xl px-6">
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
          <h2 className="mt-8 text-4xl font-semibold leading-[1.05] text-slate-900 sm:text-5xl">
            Built to master any document, from proposals to reports.
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-600">
            <span className="italic">better-write</span> unifies AI outlining, intelligent editing, and seamless formatting so you can focus on the content behind your document.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="relative overflow-hidden rounded-3xl border border-black/5 bg-[#f5f4f0] p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{pillar.eyebrow}</p>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{pillar.title}</h3>
              <p className="mt-3 text-sm font-medium text-slate-600">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}