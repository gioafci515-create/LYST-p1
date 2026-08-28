import { useLanguage } from '../../context/LanguageContext';
import type { Lang } from '../../data/translations';
import './LanguageSwitcher.css';

const options: { code: Lang; label: string }[] = [
  { code: 'ka', label: 'Geo' },
  { code: 'ru', label: 'Ru' },
  { code: 'en', label: 'En' },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-switcher">
      {options.map((option, i) => (
        <span key={option.code} className="lang-switcher__item">
          {i > 0 && <span className="lang-switcher__divider" aria-hidden="true" />}
          <button
            type="button"
            className={`lang-switcher__option eyebrow eyebrow--latin${lang === option.code ? ' is-active' : ''}`}
            onClick={() => setLang(option.code)}
            aria-pressed={lang === option.code}
          >
            {option.label}
          </button>
        </span>
      ))}
    </div>
  );
}
