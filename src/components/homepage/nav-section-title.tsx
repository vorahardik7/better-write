'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

type NavSectionTitleProps = {
  id: string;
  children: ReactNode;
};

export function NavSectionTitle({ id, children }: NavSectionTitleProps) {
  return (
    <motion.div
      layoutId={`nav-section-${id}`}
      transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
      className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] backdrop-blur"
    >
      {children}
    </motion.div>
  );
}

