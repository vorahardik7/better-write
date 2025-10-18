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
      className="inline-flex items-center gap-2 rounded-full bg-[rgba(212,163,115,0.9)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(212,163,115,0.28)] backdrop-blur"
    >
      {children}
    </motion.div>
  );
}

