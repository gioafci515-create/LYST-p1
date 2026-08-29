import { useLanguage } from '../../context/LanguageContext';
import { useInvitation } from '../../context/InvitationContext';
import { wedding } from '../../data/wedding';
import { Decor } from '../Decor';
import './RsvpTeaser.css';

interface RsvpTeaserProps {
  hasSubmitted: boolean;
  onOpen: () => void;
}

/** Square paper cut-out with the RSVP invitation laid over it.
 *  Reveal: heading mask → prompt rise (+160ms) → deadline fade (+320ms)
 *  → button (+460ms). */
export function RsvpTeaser({ hasSubmitted, onOpen }: RsvpTeaserProps) {
  const { lang, t } = useLanguage();
  const { isOpened } = useInvitation();
  const deadline = wedding.rsvpDeadline[lang];

  return (
    <section className="rsvp-teaser section">
      <Decor variant="rsvp" />
      <div className="section__inner">
        <div className="rsvp-teaser__paper" data-reveal="scale">
          <img
            src={isOpened ? 'assets/square-paper.png' : undefined}
            width={820}
            height={1230}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
          <div className="rsvp-teaser__content">
            <h2 className="section-heading rsvp-teaser__title" data-reveal="mask">
              <span className="line">
                <span className="line__inner">{t('rsvpTitle')}</span>
              </span>
            </h2>
            <p className="rsvp-teaser__prompt" data-reveal="rise" data-reveal-delay="160">
              {hasSubmitted ? t('alreadySent') : t('rsvpPrompt')}
            </p>
            {!hasSubmitted && (
              <p className="rsvp-teaser__deadline" data-reveal="fade" data-reveal-delay="320">
                {deadline}
              </p>
            )}
            <button
              type="button"
              className="paper-cta"
              onClick={onOpen}
              data-reveal="fade"
              data-reveal-delay="460"
            >
              {t('rsvpCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
