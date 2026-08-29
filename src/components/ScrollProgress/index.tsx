import { useEffect, useRef } from 'react';
import './ScrollProgress.css';

/**
 * 2px hairline tracking scroll progress. Decorative only — aria-hidden,
 * since a progress bar announced by a screen reader is noise. Uses
 * scroll-timeline where supported, a lightweight rAF fallback otherwise.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supportsScrollTimeline = CSS.supports('animation-timeline: scroll()');
    if (supportsScrollTimeline) return; // handled entirely by CSS below

    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let rafId = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      el.style.width = `${pct}%`;
      rafId = 0;
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
