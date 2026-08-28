import { useEffect, useState } from 'react';
import { useInvitation } from '../../context/InvitationContext';
import { useLanguage } from '../../context/LanguageContext';
import './BackToTop.css';

interface BackToTopProps {
  modalOpen: boolean;
}

export function BackToTop({ modalOpen }: BackToTopProps) {
  const { isOpened } = useInvitation();
  const { t } = useLanguage();
  const [pastThreshold, setPastThreshold] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setPastThreshold(window.scrollY > window.innerHeight * 1.5);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!isOpened || modalOpen || !pastThreshold) return null;

  const scrollToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={scrollToTop}
      aria-label={t('backToTop')}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3 10 L8 5 L13 10" fill="none" stroke="var(--sage)" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </button>
  );
}
