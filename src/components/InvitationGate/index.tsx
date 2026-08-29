import { useCallback, useRef, useState } from 'react';
import { useInvitation } from '../../context/InvitationContext';
import { useLanguage } from '../../context/LanguageContext';
import { wedding } from '../../data/wedding';
import './InvitationGate.css';

interface InvitationGateProps {
  onOpenAudio: () => void;
  onOpened?: () => void;
}

/**
 * STATE 1–2: the real lace envelope on the painted olive landscape.
 * Tap → seal cracks → closed envelope cross-fades to the open one
 * (flowers + D&K monogram) → gate fades into the invitation.
 */
export function InvitationGate({ onOpenAudio, onOpened }: InvitationGateProps) {
  const { open } = useInvitation();
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'sealed' | 'opening'>('sealed');
  const startedRef = useRef(false);

  const handleOpen = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    onOpened?.();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase('opening');

    if (reduced) {
      onOpenAudio();
      window.setTimeout(open, 320);
      return;
    }
    window.setTimeout(onOpenAudio, 900);
    window.setTimeout(open, 1700);
  }, [onOpenAudio, onOpened, open]);

  return (
    <div className={`gate gate--${phase}`}>
      <div className="gate__bg" aria-hidden="true" />
      <div className="gate__logo" aria-hidden="true">
        <span>{wedding.initials.first}</span>
        <span className="gate__logo-divider" />
        <span>{wedding.initials.second}</span>
      </div>

      <div className="gate__envelope-container envelope-trigger">
        <button
          type="button"
          className="envelope"
          onClick={handleOpen}
          aria-label={t('openInstruction')}
          disabled={phase === 'opening'}
        >
          <img
            className="envelope__closed"
            src="assets/envelope-closed.png"
            width={624}
            height={486}
            alt=""
            aria-hidden="true"
          />
          <img
            className="envelope__opened"
            src={phase === 'opening' ? 'assets/envelope-open.png' : undefined}
            width={700}
            height={1050}
            alt=""
            aria-hidden="true"
          />
          <span className="envelope__seal">
            <span className="envelope__seal-half envelope__seal-half--left">
              <img src="assets/wax-seal.png" alt="" aria-hidden="true" />
            </span>
            <span className="envelope__seal-half envelope__seal-half--right">
              <img src="assets/wax-seal.png" alt="" aria-hidden="true" />
            </span>
          </span>
        </button>
      </div>

      <p className="gate__instruction">{t('openInstruction')}</p>
      <p className="gate__date date-line">{wedding.shortDate}</p>
    </div>
  );
}
