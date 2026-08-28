import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../context/LanguageContext';
import { wedding } from '../../data/wedding';
import { Decor } from '../Decor';
import './Footer.css';

export function Footer() {
  const { lang, t } = useLanguage();
  const ref = useScrollReveal<HTMLElement>();

  return (
    <footer className="footer" ref={ref}>
      <Decor variant="footer" />
      <div className="footer__inner reveal">
        <p className="eyebrow footer__love">{t('withLove')}</p>
        <p className="footer__names section-heading">
          {wedding.groom[lang]} <span className="footer__amp">&amp;</span> {wedding.bride[lang]}
        </p>
      </div>
    </footer>
  );
}
