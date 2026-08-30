import { useLanguage } from '../../context/LanguageContext';
import { useInvitation } from '../../context/InvitationContext';
import './LetterSection.css';

/** A short invitation note laid over the open-envelope/letter image,
 *  right after the first couple photo. */
export function LetterSection() {
  const { t } = useLanguage();
  const { isOpened } = useInvitation();

  return (
    <section className="letter section">
      <div className="section__inner">
        <div className="letter__frame" data-reveal="scale">
          <img
            src={isOpened ? 'assets/letter-envelope.png' : undefined}
            width={1152}
            height={1366}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
          <p className="letter__text">{t('letterText')}</p>
        </div>
      </div>
    </section>
  );
}
