import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { wedding, type DressSwatch } from '../../data/wedding';
import './DressCodeSection.css';

/** A real gown silhouette (spaghetti straps, fitted bodice, flared
 *  skirt) rather than an abstract trapezoid, filled white and crossed
 *  by a red prohibition line — the no-white rule as a sign, not just a
 *  sentence. */
function NoWhiteDressIcon() {
  return (
    <svg
      className="dress-section__no-white-icon"
      viewBox="0 0 72 84"
      aria-hidden="true"
    >
      <path
        className="dress-section__no-white-dress"
        d="M30 16
           C26 22 26 30 28 36
           C22 48 18 60 16 72
           Q36 78 56 72
           C54 60 50 48 44 36
           C46 30 46 22 42 16
           Q36 22 30 16 Z"
      />
      <path
        className="dress-section__no-white-neckline"
        d="M30 16 L26 6 M42 16 L46 6"
        fill="none"
      />
      <circle className="dress-section__no-white-ring" cx="36" cy="44" r="36" fill="none" />
      <line className="dress-section__no-white-slash" x1="4" y1="10" x2="68" y2="78" />
    </svg>
  );
}

/** Its own section right under wedding details — was a modal opened
 *  from inside the details modal, now a standalone scroll stop. Same
 *  cherry theme (the tokens are referenced directly, not just via the
 *  .modal__panel-scoped aliases, so it carries over unchanged). */
export function DressCodeSection() {
  const { lang, t } = useLanguage();
  const [selected, setSelected] = useState<DressSwatch | null>(null);

  return (
    <section className="dress-section section">
      <div className="section__inner">
        <div className="dress-section__card" data-reveal="scale">
          <img
            className="dress-section__branch"
            src="assets/dresscode-branch.svg"
            width={140}
            height={78}
            alt=""
            aria-hidden="true"
          />

          <h2 className="dress-section__title" data-reveal="mask">
            <span className="line">
              <span className="line__inner">
                <span className="dress-section__rule" aria-hidden="true" />
                {t('dressCodeTitle')}
                <span className="dress-section__rule" aria-hidden="true" />
              </span>
            </span>
          </h2>
          <span className="dress-section__diamond" aria-hidden="true">
            ◇
          </span>

          <p className="dress-section__intro" data-reveal="rise" data-reveal-delay="120">
            {wedding.dressCodeIntro[lang]}
          </p>

          <div className="dress-section__no-white" data-reveal="rise" data-reveal-delay="240">
            <NoWhiteDressIcon />
            <p>{wedding.dressCodeNoWhite[lang]}</p>
            <div className="dress-section__avoid" role="list">
              {wedding.dressCodeAvoidPalette.map((swatch) => (
                <span
                  key={swatch.hex}
                  role="listitem"
                  className="dress-section__avoid-swatch"
                  aria-label={`${t('notAllowed')}: ${swatch.name[lang]}`}
                >
                  <svg viewBox="0 0 32 30" aria-hidden="true">
                    <path
                      d="M16 28 C8 21 2 15.5 2 9.5 C2 5 5.4 2 9.4 2 C12.2 2 14.8 3.6 16 6 C17.2 3.6 19.8 2 22.6 2 C26.6 2 30 5 30 9.5 C30 15.5 24 21 16 28Z"
                      fill={swatch.hex}
                    />
                  </svg>
                </span>
              ))}
            </div>
            <p className="dress-section__avoid-label" aria-hidden="true">
              {t('notAllowed')}
            </p>
          </div>

          <div
            className="dress-section__hearts"
            role="list"
            data-reveal="fade"
            data-reveal-delay="360"
          >
            {wedding.dressCodePalette.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                role="listitem"
                className={`dress-section__heart${selected?.hex === swatch.hex ? ' is-selected' : ''}`}
                aria-label={swatch.name[lang]}
                aria-pressed={selected?.hex === swatch.hex}
                onClick={() => setSelected(selected?.hex === swatch.hex ? null : swatch)}
              >
                <svg viewBox="0 0 32 30" aria-hidden="true">
                  <path
                    d="M16 28 C8 21 2 15.5 2 9.5 C2 5 5.4 2 9.4 2 C12.2 2 14.8 3.6 16 6 C17.2 3.6 19.8 2 22.6 2 C26.6 2 30 5 30 9.5 C30 15.5 24 21 16 28Z"
                    fill={swatch.hex}
                  />
                </svg>
              </button>
            ))}
          </div>
          {/* reserved line — nothing jumps when a heart is tapped */}
          <p className="dress-section__swatch-name" aria-live="polite">
            {selected ? `${selected.name[lang]} · ${selected.hex.toUpperCase()}` : ' '}
          </p>
        </div>
      </div>
    </section>
  );
}
