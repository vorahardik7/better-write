'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

import { useScrollSections } from './scroll-sections-context';

type SectionHeaderProps = {
  sectionId: string;
  label: string;
  order: number;
  children: ReactNode;
};

export function SectionHeader({ sectionId, label, order, children }: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { registerSection, unregisterSection, pinnedSections } = useScrollSections();

  useEffect(() => {
    registerSection({ id: sectionId, label, order, ref });
    return () => unregisterSection(sectionId);
  }, [sectionId, label, order, registerSection, unregisterSection]);

  const isPinned = pinnedSections.some((section) => section.id === sectionId);

  return (
    <div ref={ref} data-section-id={sectionId} className="flex flex-col items-center">
      <div className="h-10">
        {!isPinned && (
          <motion.div
            layoutId={`nav-section-${sectionId}`}
            transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.55 }}
            className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}

