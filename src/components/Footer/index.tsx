import { useLanguage } from '../../context/LanguageContext';
import { wedding } from '../../data/wedding';
import { Decor } from '../Decor';
import './Footer.css';

/** Reveal: withLove fade → names mask (+200ms). (The storyboard's third
 *  beat, an INVITÉ credit line, doesn't exist on this footer — that line
 *  was removed from the design earlier.) */
export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="footer">
      <Decor variant="footer" />
      <div className="footer__inner">
        <p className="eyebrow footer__love" data-reveal="fade">
          {t('withLove')}
        </p>
        <p className="footer__names section-heading" data-reveal="mask" data-reveal-delay="200">
          <span className="line">
            <span className="line__inner">
              {wedding.groom[lang]} <span className="footer__amp">&amp;</span> {wedding.bride[lang]}
            </span>
          </span>
        </p>
      </div>
    </footer>
  );
}
