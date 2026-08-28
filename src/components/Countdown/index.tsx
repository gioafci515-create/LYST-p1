import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useCountdown } from '../../hooks/useCountdown';
import { useLanguage } from '../../context/LanguageContext';
import { wedding } from '../../data/wedding';
import { Decor } from '../Decor';
import { WaxSeal } from '../WaxSeal';
import './Countdown.css';

const pad = (n: number) => String(n).padStart(2, '0');

export function Countdown() {
  const { t } = useLanguage();
  const ref = useScrollReveal<HTMLElement>();
  const { days, hours, minutes, seconds, isPast } = useCountdown(wedding.date);

  const units = [
    { value: days, label: t('days') },
    { value: hours, label: t('hours') },
    { value: minutes, label: t('minutes') },
    { value: seconds, label: t('seconds') },
  ];

  return (
    <section className="countdown section" ref={ref}>
      <Decor variant="countdown" />
      <div className="section__inner">
        <div className="reveal" style={{ ['--i' as string]: 0 }}>
          <WaxSeal size={72} />
        </div>
        <h2 className="eyebrow countdown__title reveal" style={{ ['--i' as string]: 1 }}>
          {t('countdownTitle')}
        </h2>
        <span className="visually-hidden">{t('countdownSr')}</span>

        {isPast ? (
          <p className="section-heading countdown__today reveal" style={{ ['--i' as string]: 2 }}>
            {t('today')}
          </p>
        ) : (
          <div className="countdown__grid reveal" style={{ ['--i' as string]: 2 }} aria-live="off" aria-hidden="true">
            {units.map((unit, i) => (
              <div key={unit.label} className={`countdown__unit${i > 0 ? ' countdown__unit--divided' : ''}`}>
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
