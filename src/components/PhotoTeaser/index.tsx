import { useLanguage } from '../../context/LanguageContext';
import './PhotoTeaser.css';

interface PhotoTeaserProps {
  onOpen: () => void;
}

/** Plain dark section (no paper cutout) between RSVP and the countdown —
 *  asks guests to upload photos taken during the celebration.
 *  Reveal: heading mask → prompt rise (+160ms) → button fade (+320ms). */
export function PhotoTeaser({ onOpen }: PhotoTeaserProps) {
  const { t } = useLanguage();

  return (
    <section className="photo-teaser section">
      <div className="section__inner">
        <h2 className="section-heading photo-teaser__title" data-reveal="mask">
          <span className="line">
            <span className="line__inner">{t('photoTitle')}</span>
          </span>
        </h2>
        <p className="photo-teaser__prompt" data-reveal="rise" data-reveal-delay="160">
          {t('photoPrompt')}
        </p>
        <button
          type="button"
          className="paper-cta"
          onClick={onOpen}
          data-reveal="fade"
          data-reveal-delay="320"
        >
          {t('photoCta')}
        </button>
      </div>
    </section>
  );
}
