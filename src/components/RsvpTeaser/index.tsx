import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../context/LanguageContext';
import { useInvitation } from '../../context/InvitationContext';
import { wedding } from '../../data/wedding';
import { Decor } from '../Decor';
import './RsvpTeaser.css';

interface RsvpTeaserProps {
  hasSubmitted: boolean;
  onOpen: () => void;
}

/** Square paper cut-out with the RSVP invitation laid over it. */
export function RsvpTeaser({ hasSubmitted, onOpen }: RsvpTeaserProps) {
  const { lang, t } = useLanguage();
  const { isOpened } = useInvitation();
  const ref = useScrollReveal<HTMLElement>();
  const deadline = wedding.rsvpDeadline[lang];

  return (
    <section className="rsvp-teaser section" ref={ref}>
      <Decor variant="rsvp" />
      <div className="section__inner">
        <div className="rsvp-teaser__paper reveal" style={{ ['--i' as string]: 0 }}>
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
            <h2 className="section-heading rsvp-teaser__title">{t('rsvpTitle')}</h2>
            <p className="rsvp-teaser__prompt">
              {hasSubmitted ? t('alreadySent') : t('rsvpPrompt')}
            </p>
            {!hasSubmitted && <p className="rsvp-teaser__deadline">{deadline}</p>}
            <button type="button" className="paper-cta" onClick={onOpen}>
              {t('rsvpCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
