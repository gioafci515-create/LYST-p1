import type { CSSProperties } from 'react';
import './Decor.css';

type Variant = 'intro' | 'photo-1' | 'photo-2' | 'details' | 'rsvp' | 'countdown' | 'footer';

/**
 * Collage layer from the real PNG cut-outs — dense, both edges, mobile
 * included, so the page reads as a full paper collage. Filters tuned per
 * asset (the champagne coupe's burgundy bow swings to olive).
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

const soften = 'saturate(0.75) brightness(0.86)';
const greenify = 'saturate(0.65) hue-rotate(24deg) brightness(0.82)';

const pieces: Record<Variant, Piece[]> = {
  intro: [
    {
      src: 'assets/flowers.png',
      style: { top: '0.5%', left: '-2%', width: 'clamp(120px, 32vw, 220px)', transform: 'rotate(-10deg)', opacity: 0.6, filter: soften },
    },
    {
      src: 'assets/butterfly.svg',
      style: { top: '10%', right: '3%', width: 'clamp(40px, 10vw, 64px)', transform: 'rotate(12deg)', opacity: 0.55 },
    },
    {
      src: 'assets/white-lily.png',
      style: { top: '38%', right: '-1%', width: 'clamp(56px, 14vw, 96px)', transform: 'rotate(14deg)', opacity: 0.5, filter: soften },
    },
    {
      src: 'assets/floral-cascade.png',
      style: { bottom: '2%', left: '-2%', width: 'clamp(80px, 20vw, 140px)', transform: 'rotate(8deg)', opacity: 0.45, filter: greenify },
    },
  ],
  'photo-1': [
    {
      src: 'assets/butterfly.svg',
      style: { top: '6%', left: '4%', width: 'clamp(36px, 9vw, 56px)', transform: 'rotate(-14deg) scaleX(-1)', opacity: 0.5 },
    },
    {
      src: 'assets/white-lily.png',
      style: { bottom: '4%', right: '0%', width: 'clamp(54px, 13vw, 90px)', transform: 'rotate(-10deg)', opacity: 0.5, filter: soften },
    },
  ],
  'photo-2': [
    {
      src: 'assets/floral-cascade.png',
      style: { bottom: '1%', right: '-1%', width: 'clamp(90px, 24vw, 170px)', transform: 'rotate(-6deg)', opacity: 0.5, filter: greenify },
    },
    {
      src: 'assets/white-lily.png',
      style: { top: '4%', left: '0%', width: 'clamp(50px, 12vw, 84px)', transform: 'rotate(-16deg) scaleX(-1)', opacity: 0.45, filter: soften },
    },
  ],
  details: [
    {
      src: 'assets/ornate-frame.png',
      style: { top: '1%', right: '-2%', width: 'clamp(80px, 20vw, 140px)', transform: 'rotate(6deg)', opacity: 0.4, filter: 'saturate(0.55) sepia(0.25) hue-rotate(40deg) brightness(0.8)' },
    },
    {
      src: 'assets/champagne-coupe.png',
      style: { bottom: '3%', left: '-1%', width: 'clamp(64px, 16vw, 110px)', transform: 'rotate(-8deg)', opacity: 0.45, filter: 'saturate(0.5) hue-rotate(95deg) brightness(0.8)' },
    },
  ],
  rsvp: [
    {
      src: 'assets/butterfly.svg',
      style: { top: '6%', right: '4%', width: 'clamp(38px, 9vw, 58px)', transform: 'rotate(10deg)', opacity: 0.5 },
    },
    {
      src: 'assets/flowers.png',
      style: { bottom: '2%', left: '-3%', width: 'clamp(90px, 22vw, 150px)', transform: 'rotate(10deg) scaleX(-1)', opacity: 0.45, filter: soften },
    },
  ],
  countdown: [
    {
      src: 'assets/champagne-coupe.png',
      style: { top: '4%', left: '0%', width: 'clamp(70px, 18vw, 120px)', transform: 'rotate(-10deg)', opacity: 0.5, filter: 'saturate(0.5) hue-rotate(95deg) brightness(0.8)' },
    },
    {
      src: 'assets/floral-cascade.png',
      style: { bottom: '4%', right: '-1%', width: 'clamp(84px, 22vw, 150px)', transform: 'scaleX(-1) rotate(4deg)', opacity: 0.45, filter: greenify },
    },
    {
      src: 'assets/butterfly.svg',
      style: { top: '12%', right: '6%', width: 'clamp(34px, 8vw, 52px)', transform: 'rotate(-12deg) scaleX(-1)', opacity: 0.45 },
    },
  ],
  footer: [
    {
      src: 'assets/white-lily.png',
      style: { top: '8%', left: '4%', width: 'clamp(46px, 11vw, 76px)', transform: 'rotate(-12deg)', opacity: 0.45, filter: soften },
    },
    {
      src: 'assets/butterfly.svg',
      style: { top: '14%', right: '5%', width: 'clamp(34px, 8vw, 52px)', transform: 'rotate(14deg)', opacity: 0.45 },
    },
  ],
};
