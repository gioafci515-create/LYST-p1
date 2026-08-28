import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../context/LanguageContext';
import { useInvitation } from '../../context/InvitationContext';
import { wedding } from '../../data/wedding';
import { Decor } from '../Decor';
import './IntroSection.css';

/** The couple's names inside the scalloped floral frame — the site's
 *  first paper object after the envelope. */
export function IntroSection() {
  const { lang, t } = useLanguage();
  const { isOpened } = useInvitation();
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section className="intro section" ref={ref}>
      <Decor variant="intro" />
      <div className="section__inner">
        <div className="intro__frame reveal" style={{ ['--i' as string]: 0 }}>
          <img
            src={isOpened ? 'assets/floral-frame.png' : undefined}
            width={640}
            height={941}
            alt=""
            aria-hidden="true"
          />
          <div className="intro__content">
            <p className="eyebrow intro__eyebrow">{t('inviteEyebrow')}</p>
            <p className="intro__title">{t('inviteTitle')}</p>
            <h1 className="intro__names">
              {wedding.groom[lang]} <span className="intro__amp script-accent">&amp;</span>{' '}
              {wedding.bride[lang]}
            </h1>
            <time className="date-line intro__date" dateTime="2026-09-02T18:00">
              {wedding.displayDate[lang]}
            </time>
            <p className="intro__body">{t('inviteBody')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
