import './WaxSeal.css';

interface WaxSealProps {
  size?: number;
  glow?: boolean;
}

/**
 * The green wax seal with the gold D·K monogram (real asset) — recurs on
 * the envelope, the RSVP submit, the success state, and the countdown.
 * `size` is the seal's width; the ribbon tails extend below it.
 */
export function WaxSeal({ size = 64, glow = true }: WaxSealProps) {
  return (
    <span
      className={`wax-seal${glow ? ' wax-seal--glow' : ''}`}
      style={{ width: size, height: size * 1.32 }}
      aria-hidden="true"
    >
      <img src="assets/wax-seal.png" width={300} height={395} alt="" />
    </span>
  );
}
