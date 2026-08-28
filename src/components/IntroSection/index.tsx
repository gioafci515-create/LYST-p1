import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../context/LanguageContext';
import { wedding } from '../../data/wedding';
import { Decor } from '../Decor';
import './IntroSection.css';

export function IntroSection() {
  const { lang, t } = useLanguage();
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section className="intro section" ref={ref}>
      <Decor variant="intro" />
      <div className="section__inner">
        <p className="eyebrow intro__eyebrow reveal" style={{ ['--i' as string]: 0 }}>
          {t('inviteEyebrow')}
        </p>
        <p className="section-heading intro__title reveal" style={{ ['--i' as string]: 1 }}>
          {t('inviteTitle')}
        </p>
        <h1 className="display-names intro__names reveal" style={{ ['--i' as string]: 2 }}>
          {wedding.groom[lang]} <span className="intro__amp script-accent">&amp;</span>{' '}
          {wedding.bride[lang]}
        </h1>
        <div className="reveal" style={{ ['--i' as string]: 3 }}>
          <time className="date-line intro__date" dateTime="2026-09-02T18:00">
            {wedding.displayDate[lang]}
          </time>
        </div>
        <p className="body-copy intro__body reveal" style={{ ['--i' as string]: 4 }}>
          {t('inviteBody')}
        </p>
      </div>
    </section>
  );
}
