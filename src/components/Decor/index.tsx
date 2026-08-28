import type { CSSProperties } from 'react';
import './Decor.css';

type Variant = 'intro' | 'photo-1' | 'photo-2' | 'details' | 'rsvp' | 'countdown' | 'footer';

/**
 * Collage layer from the real PNG cut-outs — large, tucked close against
 * the paper cards so it reads as a deliberate flourish rather than a
 * faint stray in the corner. Filters tuned per asset.
 */
export function Decor({ variant }: { variant: Variant }) {
  return (
    <div className="decor" aria-hidden="true">
      {pieces[variant].map((piece, i) => (
        <img
          key={i}
          src={piece.src}
          alt=""
          loading="lazy"
          decoding="async"
          className="decor__piece"
          style={piece.style}
        />
      ))}
    </div>
  );
}

interface Piece {
  src: string;
  style: CSSProperties;
}

const soften = 'saturate(0.8) brightness(0.9)';
const greenify = 'saturate(0.7) hue-rotate(24deg) brightness(0.85)';

const pieces: Record<Variant, Piece[]> = {
  intro: [
    /* the floral-frame.png card already carries its own flower crown at
       top-left — every added piece here sits on the RIGHT so the two
       don't stack into one lopsided mass. */
    {
      src: 'assets/butterfly.svg',
      style: { top: '13%', right: '8%', width: 'clamp(58px, 15vw, 90px)', transform: 'rotate(12deg)', opacity: 0.65 },
    },
    {
      src: 'assets/white-lily.png',
      style: { top: '38%', right: '1%', width: 'clamp(90px, 23vw, 148px)', transform: 'rotate(14deg)', opacity: 0.62, filter: soften },
    },
    {
      src: 'assets/floral-cascade.png',
      style: { bottom: '4%', right: '3%', width: 'clamp(120px, 30vw, 200px)', transform: 'scaleX(-1) rotate(-8deg)', opacity: 0.58, filter: greenify },
    },
  ],
  'photo-1': [
    {
      src: 'assets/butterfly.svg',
      style: { top: '7%', left: '9%', width: 'clamp(50px, 13vw, 78px)', transform: 'rotate(-14deg) scaleX(-1)', opacity: 0.6 },
    },
    {
      src: 'assets/white-lily.png',
      style: { bottom: '5%', right: '5%', width: 'clamp(76px, 18vw, 124px)', transform: 'rotate(-10deg)', opacity: 0.6, filter: soften },
    },
  ],
  'photo-2': [
    {
      src: 'assets/floral-cascade.png',
      style: { bottom: '2%', right: '4%', width: 'clamp(120px, 32vw, 220px)', transform: 'rotate(-6deg)', opacity: 0.6, filter: greenify },
    },
    {
      src: 'assets/white-lily.png',
      style: { top: '5%', left: '5%', width: 'clamp(70px, 17vw, 116px)', transform: 'rotate(-16deg) scaleX(-1)', opacity: 0.55, filter: soften },
    },
  ],
  details: [
    {
      src: 'assets/ornate-frame.png',
      style: { top: '-1%', right: '3%', width: 'clamp(110px, 26vw, 180px)', transform: 'rotate(6deg)', opacity: 0.5, filter: 'saturate(0.6) sepia(0.25) hue-rotate(40deg) brightness(0.85)' },
    },
    {
      src: 'assets/champagne-coupe.png',
      style: { bottom: '0%', left: '3%', width: 'clamp(90px, 22vw, 150px)', transform: 'rotate(-8deg)', opacity: 0.55, filter: 'saturate(0.55) hue-rotate(95deg) brightness(0.85)' },
    },
  ],
  rsvp: [
    {
      src: 'assets/butterfly.svg',
      style: { top: '5%', right: '8%', width: 'clamp(52px, 13vw, 80px)', transform: 'rotate(10deg)', opacity: 0.6 },
    },
    {
      src: 'assets/flowers.png',
      style: { bottom: '-1%', left: '1%', width: 'clamp(130px, 30vw, 210px)', transform: 'rotate(10deg) scaleX(-1)', opacity: 0.55, filter: soften },
    },
  ],
  countdown: [
    {
      src: 'assets/champagne-coupe.png',
      style: { top: '3%', left: '3%', width: 'clamp(96px, 24vw, 160px)', transform: 'rotate(-10deg)', opacity: 0.6, filter: 'saturate(0.55) hue-rotate(95deg) brightness(0.85)' },
    },
    {
      src: 'assets/floral-cascade.png',
      style: { bottom: '3%', right: '2%', width: 'clamp(120px, 30vw, 200px)', transform: 'scaleX(-1) rotate(4deg)', opacity: 0.55, filter: greenify },
    },
    {
      src: 'assets/butterfly.svg',
      style: { top: '12%', right: '10%', width: 'clamp(46px, 11vw, 70px)', transform: 'rotate(-12deg) scaleX(-1)', opacity: 0.55 },
    },
  ],
  footer: [
    {
      src: 'assets/white-lily.png',
      style: { top: '6%', left: '7%', width: 'clamp(64px, 16vw, 106px)', transform: 'rotate(-12deg)', opacity: 0.55, filter: soften },
    },
    {
      src: 'assets/butterfly.svg',
      style: { top: '12%', right: '9%', width: 'clamp(46px, 11vw, 70px)', transform: 'rotate(14deg)', opacity: 0.55 },
    },
  ],
};
