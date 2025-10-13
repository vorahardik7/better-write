'use client';

import type { MutableRefObject, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LayoutGroup } from 'motion/react';

const DEFAULT_NAV_HEIGHT = 88;
const NAV_OFFSET = 8;

type SectionRecord = {
  id: string;
  label: string;
  order: number;
  ref: MutableRefObject<HTMLElement | null>;
  isPinned: boolean;
};

type RegisterSectionArgs = {
  id: string;
  label: string;
  order: number;
  ref: MutableRefObject<HTMLElement | null>;
};

type ScrollSectionsContextValue = {
  sections: SectionRecord[];
  pinnedSections: SectionRecord[];
  registerSection: (args: RegisterSectionArgs) => void;
  unregisterSection: (id: string) => void;
  registerNav: (node: HTMLDivElement | null) => void;
  scrollToSection: (id: string) => void;
};

const ScrollSectionsContext = createContext<ScrollSectionsContextValue | null>(null);

export function ScrollSectionsProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const navHeightRef = useRef<number>(DEFAULT_NAV_HEIGHT);
  const scrollFrame = useRef<number | null>(null);

  const updatePinnedState = useCallback(() => {
    setSections((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      let changed = false;
      const next = prev.map((section) => {
        const el = section.ref.current;
        if (!el) {
          return section;
        }

        const rect = el.getBoundingClientRect();
        const inNav = rect.top <= navHeightRef.current + NAV_OFFSET;

        if (section.isPinned !== inNav) {
          changed = true;
          return { ...section, isPinned: inNav };
        }

        return section;
      });

      return changed ? next : prev;
    });
  }, []);

  const queuePinnedUpdate = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (scrollFrame.current) {
      cancelAnimationFrame(scrollFrame.current);
    }
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = null;
      updatePinnedState();
    });
  }, [updatePinnedState]);

  const registerSection = useCallback(
    ({ id, label, order, ref }: RegisterSectionArgs) => {
      setSections((prev) => {
        let changed = false;
        const hasExisting = prev.some((section) => section.id === id);
        const next = hasExisting
          ? prev.map((section) => {
              if (section.id !== id) return section;
              changed =
                changed || section.label !== label || section.order !== order || section.ref !== ref;
              return { ...section, label, order, ref };
            })
          : [...prev, { id, label, order, ref, isPinned: false }];

        if (!hasExisting || changed) {
          next.sort((a, b) => a.order - b.order);
          return next;
        }

        return prev;
      });

      queuePinnedUpdate();
    },
    [queuePinnedUpdate],
  );

  const unregisterSection = useCallback(
    (id: string) => {
      setSections((prev) => prev.filter((section) => section.id !== id));
      queuePinnedUpdate();
    },
    [queuePinnedUpdate],
  );

  const registerNav = useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof window === 'undefined') return;

      navHeightRef.current = node?.getBoundingClientRect().height ?? DEFAULT_NAV_HEIGHT;
      queuePinnedUpdate();
    },
    [queuePinnedUpdate],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleScroll = () => {
      queuePinnedUpdate();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    queuePinnedUpdate();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);

      if (scrollFrame.current) {
        cancelAnimationFrame(scrollFrame.current);
        scrollFrame.current = null;
      }
    };
  }, [queuePinnedUpdate]);

  const pinnedSections = useMemo(
    () => sections.filter((section) => section.isPinned),
    [sections],
  );

  const scrollToSection = useCallback(
    (id: string) => {
      if (typeof window === 'undefined') return;

      const el = document.getElementById(id);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const targetTop = window.scrollY + rect.top - (navHeightRef.current + NAV_OFFSET * 2);

      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    },
    [],
  );

  const value = useMemo<ScrollSectionsContextValue>(
    () => ({
      sections,
      pinnedSections,
      registerSection,
      unregisterSection,
      registerNav,
      scrollToSection,
    }),
    [sections, pinnedSections, registerSection, unregisterSection, registerNav, scrollToSection],
  );

  return (
    <ScrollSectionsContext.Provider value={value}>
      <LayoutGroup id="scroll-sections-layout">{children}</LayoutGroup>
    </ScrollSectionsContext.Provider>
  );
}

export function useScrollSections() {
  const context = useContext(ScrollSectionsContext);

  if (!context) {
    throw new Error('useScrollSections must be used within a ScrollSectionsProvider');
  }

  return context;
}

