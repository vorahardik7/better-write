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
    <section id="features" className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <SectionHeader sectionId="features" label="Features" order={1}>
          Features
        </SectionHeader>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-8 max-w-3xl text-center sm:mt-10"
        >
          <h2 className="mt-6 text-3xl font-semibold leading-[1.08] text-slate-900 sm:mt-8 sm:text-4xl md:text-5xl">
            Built to master any document, from proposals to reports.
          </h2>
          <p className="mt-4 text-base font-medium text-slate-600 sm:text-lg">
            <span className="italic">better-write</span> unifies AI outlining, intelligent editing, and seamless formatting so you can focus on the content behind your document.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="relative overflow-hidden rounded-3xl border border-black/5 bg-[#f5f4f0] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-7 lg:p-8"
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-xs">{pillar.eyebrow}</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900 sm:mt-4 sm:text-xl">{pillar.title}</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}