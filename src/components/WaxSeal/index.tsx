import type { CSSProperties } from 'react';
import './WaxSeal.css';

interface WaxSealProps {
  size?: number;
  glow?: boolean;
  /** Opt into the scroll-reveal engine: scales up from `scaleFrom` with
   *  the glow fading in alongside it. Off by default — most usages
   *  (RSVP submit, success state) don't scroll-reveal at all. */
  reveal?: boolean;
  scaleFrom?: number;
  revealDelay?: number;
}

/**
 * The green wax seal with the gold D·K monogram (real asset) — recurs on
 * the envelope, the RSVP submit, the success state, and the countdown.
 * `size` is the seal's width; the ribbon tails extend below it.
 */
export function WaxSeal({
  size = 64,
  glow = true,
  reveal = false,
  scaleFrom = 0.86,
  revealDelay,
}: WaxSealProps) {
  const style: CSSProperties = { width: size, height: size * 1.5 };
  if (reveal) (style as Record<string, string>)['--scale-from'] = String(scaleFrom);

  return (
    <span
      className={`wax-seal${glow ? ' wax-seal--glow' : ''}`}
      style={style}
      aria-hidden="true"
      data-reveal={reveal ? 'scale' : undefined}
      data-reveal-delay={reveal ? revealDelay : undefined}
    >
      <img
        src="assets/wax-seal.png"
        width={300}
        height={450}
        alt=""
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
