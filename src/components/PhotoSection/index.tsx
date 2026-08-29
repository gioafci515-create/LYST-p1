import { useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useInvitation } from '../../context/InvitationContext';
import { useScrollDrift } from '../../hooks/useScrollDrift';
import type { WeddingPhoto } from '../../data/wedding';
import './PhotoSection.css';

interface PhotoSectionProps {
  photo: WeddingPhoto;
  altKey: 'photoAlt1' | 'photoAlt2';
}

/** Real photo, polaroid frame baked into the asset (tilt + shadow
 *  included). Entrance: scale reveal. Scroll-linked: the image drifts at
 *  most 6% via native animation-timeline: view() (PhotoSection.css),
 *  with a batched rAF fallback for browsers that lack it. */
export function PhotoSection({ photo, altKey }: PhotoSectionProps) {
  const { t } = useLanguage();
  const { isOpened } = useInvitation();
  const imgRef = useRef<HTMLImageElement>(null);

  useScrollDrift(imgRef, 3); // ±3% == 6% total range

  return (
    <section className="photo-section section">
      <div className="section__inner">
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
          data-reveal="scale"
        />
      </div>
    </section>
  );
}
