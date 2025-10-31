'use client';

import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { EditorContent } from '@tiptap/react';
import { calculateContentMetrics } from '@/lib/content-utils';

interface EditorCanvasProps {
  editor: Editor;
  contentJson: any;
  onPageMetrics?: (currentPage: number, totalPages: number) => void;
  pageFormat?: 'Letter' | 'A4' | 'Legal';
  pageGap?: number; // visual gap between pages (px)
}

export function EditorCanvas({ editor, contentJson, onPageMetrics, pageFormat = 'Letter', pageGap = 40 }: EditorCanvasProps) {
  // Free setup: page size presets
  const FORMAT_MAP: Record<'Letter' | 'A4' | 'Legal', { width: number; height: number }> = {
    Letter: { width: 818, height: 1060 },
    A4: { width: 794, height: 1123 },
    Legal: { width: 818, height: 1404 },
  };
  const PAGE_WIDTH_PX = FORMAT_MAP[pageFormat].width;
  const PAGE_HEIGHT_PX = FORMAT_MAP[pageFormat].height;

  const pageCount = useMemo(() => {
    try {
      if (!contentJson) return 1;
      return calculateContentMetrics(contentJson).pageCount;
    } catch {
      return 1;
    }
  }, [contentJson]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const topPadding = 48; // pt-12
    const position = Math.max(0, scrollTop - topPadding);
    const effectivePageHeight = PAGE_HEIGHT_PX + pageGap; // include visual gap
    const page = Math.floor(position / effectivePageHeight) + 1;
    onPageMetrics?.(Math.max(1, Math.min(page, Math.max(1, pageCount))), pageCount);
  }, [onPageMetrics, pageCount, PAGE_HEIGHT_PX, pageGap]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll as any);
  }, [handleScroll]);

  return (
    <div ref={scrollRef} className="flex-1 relative bg-[#fefae0] overflow-auto">
      <div className="max-w-4xl mx-auto px-8 pt-12 pb-32 h-full">
        <div className="relative bg-[#fffdf3] rounded-2xl shadow-[0_24px_56px_rgba(136,153,79,0.22)] border border-[rgba(136,153,79,0.22)] min-h-[calc(100vh-16rem)] p-8 overflow-hidden">
          {/* Visual page breaks and fixed page width */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `repeating-linear-gradient(to bottom,
                transparent, transparent ${PAGE_HEIGHT_PX}px,
                transparent ${PAGE_HEIGHT_PX}px,
                rgba(106,123,87,0.35) ${PAGE_HEIGHT_PX + Math.max(1, Math.min(2, pageGap/10))}px
              )`,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,1) 24px, rgba(0,0,0,1) calc(100% - 24px), rgba(0,0,0,0.5))',
            }}
          />
          <div className="relative mx-auto" style={{ width: `${PAGE_WIDTH_PX}px` }}>
            <EditorContent
              editor={editor}
              className="prose prose-lg max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[600px] [&_.ProseMirror]:max-w-full [&_.ProseMirror]:break-words [&_.ProseMirror]:px-12 [&_.ProseMirror]:py-12"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


