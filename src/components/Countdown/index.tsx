import { useCountdown } from '../../hooks/useCountdown';
import { useLanguage } from '../../context/LanguageContext';
import { wedding } from '../../data/wedding';
import { Decor } from '../Decor';
import { WaxSeal } from '../WaxSeal';
import './Countdown.css';

const pad = (n: number) => String(n).padStart(2, '0');

/** Reveal: wax seal scales from 0.86 with its glow fading up over
 *  --dur-slow → title mask (+200ms) → the four units rise with stagger
 *  (+380ms). Digits animate in once; ticking afterwards never
 *  re-triggers the reveal (classList add is one-shot). */
export function Countdown() {
  const { t } = useLanguage();
  const { days, hours, minutes, seconds, isPast } = useCountdown(wedding.date);

  const units = [
    { value: days, label: t('days') },
    { value: hours, label: t('hours') },
    { value: minutes, label: t('minutes') },
    { value: seconds, label: t('seconds') },
  ];

  return (
    <section className="countdown section">
      <Decor variant="countdown" />
      <div className="section__inner">
        <div className="countdown__seal-sticky">
          <WaxSeal size={72} reveal scaleFrom={0.86} />
        </div>
        <h2 className="eyebrow countdown__title" data-reveal="mask" data-reveal-delay="200">
          <span className="line">
            <span className="line__inner">{t('countdownTitle')}</span>
          </span>
        </h2>
        <span className="visually-hidden">{t('countdownSr')}</span>

        {isPast ? (
          <p className="section-heading countdown__today" data-reveal="rise" data-reveal-delay="380">
            {t('today')}
          </p>
        ) : (
          <div
            className="countdown__grid"
            data-reveal-stagger
            aria-live="off"
            aria-hidden="true"
          >
            {units.map((unit, i) => (
              <div
                key={unit.label}
                className={`countdown__unit${i > 0 ? ' countdown__unit--divided' : ''}`}
                data-reveal="rise"
                data-reveal-delay="380"
              >
                <span className="countdown__value">{pad(unit.value)}</span>
                <span className="countdown__label">{unit.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
