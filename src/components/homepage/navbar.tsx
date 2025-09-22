'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';

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
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="py-4">
          <motion.div 
            className="flex items-center justify-between px-4 h-16"
            animate={{
              backgroundColor: scrolled ? '#ffffff' : 'transparent',
              borderWidth: scrolled ? '2px' : '0px',
              borderColor: scrolled ? '#000000' : 'transparent',
              borderRadius: scrolled ? '12px' : '0px',
              boxShadow: scrolled ? '6px 6px 0 #000000' : 'none',
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
          >
            <motion.div 
              className="font-bold text-xl"
              animate={{
                color: scrolled ? '#000000' : '#1f2937',
              }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut'
              }}
            >
              BetterWrite
            </motion.div>
            <nav className="hidden md:flex items-center gap-6 text-md">
              {navItems.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className="hover:underline cursor-pointer"
                  animate={{
                    color: scrolled ? '#000000' : '#4b5563',
                  }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeInOut'
                  }}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

