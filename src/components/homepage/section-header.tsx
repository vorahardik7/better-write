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
    <div ref={ref} data-section-id={sectionId} className="mb-6 flex flex-col items-center sm:mb-10">
      <div className="flex h-9 items-center sm:h-10">
        {!isPinned && (
          <motion.div
            layoutId={`nav-section-${sectionId}`}
            transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.55 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/75 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-500 shadow-[0_20px_36px_rgba(15,23,42,0.12)] backdrop-blur sm:gap-3 sm:px-6 sm:py-2 sm:text-xs sm:tracking-[0.3em]"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}

