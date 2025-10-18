'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

import { useScrollSections } from './scroll-sections-context';
import { NavSectionTitle } from './nav-section-title';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { pinnedSections, registerNav, scrollToSection } = useScrollSections();
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const setNavRef = useCallback(
    (node: HTMLDivElement | null) => {
      navRef.current = node;
      registerNav(node);
    },
    [registerNav],
  );

  const handlePinnedClick = useCallback(
    (sectionId: string) => {
      scrollToSection(sectionId);
    },
    [scrollToSection],
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5">
      <div className="pointer-events-auto w-full max-w-5xl">
        <motion.div
          ref={setNavRef}
          className="relative flex h-16 items-center justify-center rounded-full border border-[#ccd5ae]/40 bg-[#fefae0]/80 px-6 backdrop-blur transition"
          animate={{
            boxShadow: scrolled
              ? '0px 25px 60px rgba(212,163,115,0.26)'
              : '0px 12px 30px rgba(212,163,115,0.12)',
            opacity: scrolled ? 1 : 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <motion.div
            className="flex items-center gap-3 text-base font-semibold text-slate-900"
            animate={{ opacity: scrolled ? 0.92 : 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="flex h-10 w-10 items-center justify-center">
              <Image
                src="/image.png"
                alt="BetterWrite Logo"
                width={28}
                height={28}
                className="h-6 w-6"
              />
            </div>
            <div>
              <span className="text-lg font-semibold text-slate-900">
                <span>better-write</span>
              </span>
            </div>
          </motion.div>

          {!!pinnedSections.length && (
            <div className="pointer-events-none absolute inset-y-0 right-6 hidden items-center gap-3 md:flex">
              {pinnedSections.map((section) => (
                <motion.button
                  key={section.id}
                  type="button"
                  onClick={() => handlePinnedClick(section.id)}
                  whileTap={{ scale: 0.97 }}
                  className="pointer-events-auto"
                >
                  <NavSectionTitle id={section.id}>{section.label}</NavSectionTitle>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

