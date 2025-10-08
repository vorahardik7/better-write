'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { href: '#features', label: 'Features' },
    { href: '#demo', label: 'Demo' },
    { href: '#pricing', label: 'Pricing' },
  ];

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, selector: string) => {
    e.preventDefault();
    const el = document.querySelector(selector);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const navbarHeight = 80; // Account for fixed navbar height
    const absoluteTop = window.scrollY + rect.top;
    const viewportCenter = window.innerHeight / 2;
    const elementCenterOffset = rect.height / 2;
    const targetScrollTop = absoluteTop - viewportCenter + elementCenterOffset + navbarHeight - 100;
    window.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5">
      <div className="pointer-events-auto w-full max-w-5xl">
        <motion.div
          className="flex h-16 items-center justify-between rounded-full border border-black/5 bg-white/80 px-6 backdrop-blur transition"
          animate={{
            boxShadow: scrolled ? '0px 25px 60px rgba(15,23,42,0.12)' : '0px 12px 30px rgba(15,23,42,0)',
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
                src="/better-write.ico"
                alt="BetterWrite Logo"
                width={28}
                height={28}
                className="h-6 w-6"
              />
            </div>
            <div>
              <span className="text-lg font-semibold text-slate-900"><span>better-write</span></span>
            </div>
          </motion.div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            {navItems.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className="transition hover:text-slate-900"
                animate={{ color: scrolled ? '#0f172a' : '#475569' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>
        </motion.div>
      </div>
    </div>
  );
}

