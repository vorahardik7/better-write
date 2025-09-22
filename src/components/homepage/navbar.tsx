'use client';

import { useCallback } from 'react';

export function Navbar() {
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
          <div className="flex items-center justify-between bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_#000] px-4 h-16">
            <div className="font-bold">BetterWrite</div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className="hover:underline cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

