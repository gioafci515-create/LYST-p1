import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;

function applyLock() {
  savedScrollY = window.scrollY;
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
}

function releaseLock() {
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = '';
  body.style.overflow = '';
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  window.scrollTo(0, savedScrollY);
}

/**
 * Locks body scroll while `locked` is true. Refcounted so nested lockers
 * (modal inside modal) don't release the lock early. iOS-safe
 * position: fixed pattern; restores scroll position on final release.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    if (lockCount === 1) applyLock();
    return () => {
      lockCount -= 1;
      if (lockCount === 0) releaseLock();
    };
  }, [locked]);
}
