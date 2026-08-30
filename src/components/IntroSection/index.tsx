import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useInvitation } from '../../context/InvitationContext';
import { wedding } from '../../data/wedding';
import './IntroSection.css';

/** The couple's names inside the scalloped floral frame — the site's
 *  first paper object after the envelope.
 *
 *  Reveals on envelope-open, not on scroll (data-reveal-manual): eyebrow
 *  (0ms) → names, mask (180ms) → date (520ms) → body (700ms) → decor,
 *  fade (900ms). */
export function IntroSection() {
  const { lang, t } = useLanguage();
  const { isOpened } = useInvitation();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpened || !sectionRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = sectionRef.current.querySelectorAll<HTMLElement>('[data-reveal]');
    els.forEach((el) => {
      if (reduced) {
        el.classList.add('is-revealed');
        return;
      }
      // will-change only for the duration of the transition it's about
      // to run, never held upfront — see useRevealEngine for why
      el.style.setProperty('will-change', 'opacity, transform');
      el.classList.add('is-revealed');
      el.addEventListener(
        'transitionend',
        () => el.style.removeProperty('will-change'),
        { once: true },
      );
    });
  }, [isOpened]);

  return (
    <section className="intro section" ref={sectionRef} data-reveal-manual>
      <div className="section__inner">
        <div className="intro__frame">
          <img
            src={isOpened ? 'assets/floral-frame.png' : undefined}
            width={640}
            height={941}
            alt=""
            aria-hidden="true"
          />
          <div className="intro__content">
            <p className="eyebrow intro__eyebrow" data-reveal="rise">
              {t('inviteEyebrow')}
            </p>
            <p className="intro__title" data-reveal="rise" data-reveal-delay="60">
              {t('inviteTitle')}
            </p>
            <h1 className="intro__names" data-reveal="mask" data-reveal-delay="180">
              <span className="line">
                <span className="line__inner">
                  {wedding.groom[lang]} <span className="intro__amp script-accent">&amp;</span>{' '}
                  {wedding.bride[lang]}
                </span>
              </span>
            </h1>
            <time
              className="date-line intro__date"
              dateTime="2026-09-02T18:00"
              data-reveal="rise"
              data-reveal-delay="520"
            >
              {wedding.displayDate[lang]}
            </time>
            <p className="intro__body" data-reveal="rise" data-reveal-delay="700">
              {t('inviteBody')}
            </p>
          </div>
        </div>
        <div className="intro__quote-frame" data-reveal="fade" data-reveal-delay="900">
          <img
            src={isOpened ? 'assets/quote-plaque.png' : undefined}
            width={1672}
            height={941}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
          <p className="intro__quote">{t('introQuote')}</p>
        </div>
      </div>
    </section>
  );
}
