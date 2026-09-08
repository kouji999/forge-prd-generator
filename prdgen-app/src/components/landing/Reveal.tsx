'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RevealState = 'idle' | 'hidden' | 'shown';

/**
 * Scroll-reveal wrapper. Server-renders fully visible (no-JS safe). After
 * mount, an IntersectionObserver arms the hidden state only when the element
 * is NOT already in view, then reveals on intersection. Reduced motion and
 * missing IntersectionObserver keep the default visible state.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Transition delay in ms, for staggering sibling reveals. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 'idle' already renders visible: nothing to do for reduced motion
    // or environments without IntersectionObserver.
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.some((e) => e.isIntersecting);
        if (intersecting) {
          io.disconnect();
          setState('shown');
        } else {
          // First pass arms the hidden state only for off-screen elements,
          // so above-the-fold content never flashes away.
          setState((prev) => (prev === 'idle' ? 'hidden' : prev));
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        // Hidden state carries no transition: arming happens off-screen.
        state === 'hidden' && 'translate-y-3 opacity-0',
        // Shown state introduces the transition so the reveal animates.
        state === 'shown' &&
          'translate-y-0 opacity-100 transition-[transform,opacity] duration-500 ease-out',
        className
      )}
    >
      {children}
    </div>
  );
}
