import { useEffect } from 'react';

/**
 * Fallback for browsers without `animation-timeline: view()` (the CSS
 * handles drift for free where supported — see PhotoSection.css). One
 * shared rAF loop for the entire page, batched read-then-write per
 * frame, per the Phase 4 performance budget. Registers/unregisters
 * itself and stops entirely once no tracked element remains; also
 * pauses on visibilitychange → hidden.
 */

interface Tracked {
  el: HTMLElement;
  maxDriftPct: number; // e.g. 3 for a ±3% drift
}

const tracked = new Set<Tracked>();
let rafId = 0;
let running = false;

function frame() {
  rafId = 0;
  if (tracked.size === 0 || document.hidden) {
    running = false;
    return;
  }
  const vh = window.innerHeight;
  // read phase
  const updates: { el: HTMLElement; shift: number }[] = [];
  for (const t of tracked) {
    const rect = t.el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) continue;
    const progress = (vh - rect.top) / (vh + rect.height); // 0..1
    const shift = (progress - 0.5) * 2 * t.maxDriftPct; // -max..max
    updates.push({ el: t.el, shift });
  }
  // write phase
  for (const u of updates) {
    u.el.style.translate = `0 ${u.shift.toFixed(2)}%`;
  }
  rafId = requestAnimationFrame(frame);
}

function ensureLoop() {
  if (!running) {
    running = true;
    rafId = requestAnimationFrame(frame);
  }
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) ensureLoop();
  else if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
    running = false;
  }
});

export function useScrollDrift(ref: React.RefObject<HTMLElement>, maxDriftPct: number): void {
  useEffect(() => {
    if (CSS.supports('animation-timeline: view()')) return; // CSS handles it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;

    const entry: Tracked = { el, maxDriftPct };
    tracked.add(entry);
    ensureLoop();

    return () => {
      tracked.delete(entry);
      el.style.removeProperty('translate');
    };
  }, [ref, maxDriftPct]);
}
