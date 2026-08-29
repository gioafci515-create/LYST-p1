import { useEffect } from 'react';

/**
 * One shared IntersectionObserver for the whole page. Mount once in App.
 *
 * Scans for every [data-reveal] element once on mount, applies stagger
 * indices (from a [data-reveal-stagger] ancestor) and explicit delays
 * (data-reveal-delay="240") as CSS custom properties, then observes each.
 * On intersect: adds .is-revealed, drops will-change, unobserves —
 * never re-hides on scroll up.
 *
 * Elements inside a [data-reveal-manual] ancestor are skipped entirely —
 * those reveal on a component-driven event (e.g. the envelope opening)
 * rather than on scroll; the owning component adds .is-revealed itself.
 */
export function useRevealEngine(): void {
  useEffect(() => {
    const allReveal = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (allReveal.length === 0) return;

    const manualRoots = document.querySelectorAll<HTMLElement>('[data-reveal-manual]');
    const manualEls = new Set<HTMLElement>();
    manualRoots.forEach((root) => {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => manualEls.add(el));
    });

    const staggerParents = document.querySelectorAll<HTMLElement>('[data-reveal-stagger]');
    staggerParents.forEach((parent) => {
      const children = Array.from(parent.querySelectorAll<HTMLElement>('[data-reveal]'));
      children.forEach((child, i) => child.style.setProperty('--i', String(i)));
    });

    allReveal.forEach((el) => {
      const delay = el.getAttribute('data-reveal-delay');
      if (delay) el.style.setProperty('--delay', `${delay}ms`);
    });

    const clearWillChange = (el: HTMLElement) => {
      el.style.removeProperty('will-change');
      el.removeEventListener('transitionend', onTransitionEnd);
    };
    function onTransitionEnd(this: HTMLElement) {
      clearWillChange(this);
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observedEls = allReveal.filter((el) => !manualEls.has(el));

    if (reduced) {
      observedEls.forEach((el) => {
        el.classList.add('is-revealed');
        el.style.removeProperty('will-change');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // will-change goes on right as the transition starts, not
          // upfront on page load — dozens of [data-reveal] elements all
          // holding compositor layers before they're even near the
          // viewport measurably delayed first paint (confirmed via
          // Lighthouse: ~13s LCP render-delay until this was removed).
          el.style.setProperty('will-change', 'opacity, transform');
          el.classList.add('is-revealed');
          el.addEventListener('transitionend', onTransitionEnd, { once: true });
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -12% 0px' },
    );

    observedEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
