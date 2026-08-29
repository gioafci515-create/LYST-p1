import { useLanguage } from '../../context/LanguageContext';
import { useInvitation } from '../../context/InvitationContext';
import './DetailsTeaser.css';

interface DetailsTeaserProps {
  onOpen: () => void;
}

/** The reference's dove paper cut-out, with native text laid over it.
 *  Reveal: heading mask → hairline expands from center (900ms) → button
 *  rise at +300ms. */
export function DetailsTeaser({ onOpen }: DetailsTeaserProps) {
  const { t } = useLanguage();
  const { isOpened } = useInvitation();

  return (
    <section className="details-teaser section">
      <div className="section__inner">
        <div className="details-teaser__paper" data-reveal="scale">
          <img
            src={isOpened ? 'assets/flower-paper.png' : undefined}
            width={820}
            height={846}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
          <div className="details-teaser__content">
            <h2 className="section-heading details-teaser__title" data-reveal="mask">
              <span className="line">
                <span className="line__inner">{t('detailsTitle')}</span>
              </span>
            </h2>
            <span className="details-teaser__rule" data-reveal="fade" data-reveal-delay="140" />
            <button
              type="button"
              className="paper-cta"
              onClick={onOpen}
              data-reveal="fade"
              data-reveal-delay="300"
            >
              {t('detailsCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
