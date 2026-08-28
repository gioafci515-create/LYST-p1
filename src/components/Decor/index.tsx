import type { CSSProperties } from 'react';
import './Decor.css';

type Variant = 'intro' | 'photo-2' | 'details' | 'countdown';

/**
 * Collage layer from the real PNG cut-outs. Pieces hug the content column
 * (slight edge offsets only) so they read as part of the composition, not
 * strays at the screen edge. Filters tuned per asset.
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
          className={`decor__piece${piece.mobileHidden ? ' decor__piece--desktop' : ''}`}
          style={piece.style}
        />
      ))}
    </div>
  );
}

interface Piece {
  src: string;
  style: CSSProperties;
  mobileHidden?: boolean;
}

const pieces: Record<Variant, Piece[]> = {
  intro: [
    {
      src: 'assets/flowers.png',
      style: {
        top: '1%',
        left: '-2%',
        width: 'clamp(130px, 34vw, 230px)',
        transform: 'rotate(-10deg)',
        opacity: 0.55,
        filter: 'saturate(0.8) brightness(0.88)',
      },
    },
    {
      src: 'assets/butterfly.svg',
      style: {
        top: '16%',
        right: '4%',
        width: 'clamp(44px, 11vw, 70px)',
        transform: 'rotate(12deg)',
        opacity: 0.5,
      },
    },
    {
      src: 'assets/white-lily.png',
      style: {
        top: '40%',
        right: '0%',
        width: 'clamp(60px, 15vw, 100px)',
        transform: 'rotate(14deg)',
        opacity: 0.5,
        filter: 'saturate(0.7) brightness(0.85)',
      },
      mobileHidden: true,
    },
  ],
  'photo-2': [
    {
      src: 'assets/floral-cascade.png',
      style: {
        bottom: '0%',
        right: '-1%',
        width: 'clamp(100px, 26vw, 180px)',
        transform: 'rotate(-6deg)',
        opacity: 0.5,
        filter: 'saturate(0.65) hue-rotate(24deg) brightness(0.82)',
      },
    },
  ],
  details: [
    {
      src: 'assets/ornate-frame.png',
      style: {
        top: '0%',
        right: '-2%',
        width: 'clamp(90px, 22vw, 150px)',
        transform: 'rotate(6deg)',
        opacity: 0.35,
        filter: 'saturate(0.55) sepia(0.25) hue-rotate(40deg) brightness(0.8)',
      },
      mobileHidden: true,
    },
  ],
  countdown: [
    {
      src: 'assets/champagne-coupe.png',
      style: {
        top: '4%',
        left: '0%',
        width: 'clamp(80px, 20vw, 130px)',
        transform: 'rotate(-10deg)',
        opacity: 0.45,
        filter: 'saturate(0.5) hue-rotate(95deg) brightness(0.8)',
      },
    },
    {
      src: 'assets/butterfly.svg',
      style: {
        bottom: '10%',
        right: '3%',
        width: 'clamp(40px, 10vw, 64px)',
        transform: 'rotate(-14deg) scaleX(-1)',
        opacity: 0.45,
      },
      mobileHidden: true,
    },
  ],
};
