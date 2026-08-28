import { useEffect, useRef } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../context/LanguageContext';
import { useInvitation } from '../../context/InvitationContext';
import type { WeddingPhoto } from '../../data/wedding';
import { Decor } from '../Decor';
import './PhotoSection.css';

interface PhotoSectionProps {
  index: 1 | 2;
  photo: WeddingPhoto;
  altKey: 'photoAlt1' | 'photoAlt2';
}

/** Real photo, polaroid frame baked into the asset (tilt + shadow included). */
export function PhotoSection({ index, photo, altKey }: PhotoSectionProps) {
  const { t } = useLanguage();
  const { isOpened } = useInvitation();
  const ref = useScrollReveal<HTMLElement>();
  const imgRef = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Whole-object drift, at most ±6px — the frame is part of the image now.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const section = sectionRef.current;
        const img = imgRef.current;
        if (!section || !img) return;
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = (vh - rect.top) / (vh + rect.height); // 0..1
        const shift = (progress - 0.5) * 12; // -6px..6px
        img.style.transform = `translateY(${shift}px)`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="photo-section section"
      ref={(node) => {
        sectionRef.current = node;
        ref(node);
      }}
    >
      <Decor variant={index === 1 ? 'photo-1' : 'photo-2'} />
      <div className="section__inner reveal">
        {/* src attaches only after the envelope opens — before that the
            megabyte polaroids would compete with the gate's first paint */}
        <img
          ref={imgRef}
          className="photo-section__polaroid"
          src={isOpened ? photo.src : undefined}
          width={photo.width}
          height={photo.height}
          alt={t(altKey)}
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
