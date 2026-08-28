import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { wedding, type DressSwatch } from '../../data/wedding';
import { Modal } from '../Modal';
import './DressCodeModal.css';

/**
 * The cream insert — the one screen that inverts to paper. Branch ornament,
 * masthead, intro, the no-white rule, and the seven heart swatches.
 */
export function DressCodeModal({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLanguage();
  const [selected, setSelected] = useState<DressSwatch | null>(null);

  return (
    <Modal titleId="dresscode-title" onClose={onClose} panelClassName="modal__panel--paper">
      <div className="dress-modal">
        <img
          className="dress-modal__branch"
          src="assets/dresscode-branch.png"
          width={140}
          height={78}
          alt=""
          aria-hidden="true"
        />

        <h2 id="dresscode-title" className="dress-modal__title">
          <span className="dress-modal__rule" aria-hidden="true" />
          {t('dressCodeTitle')}
          <span className="dress-modal__rule" aria-hidden="true" />
        </h2>
        <span className="dress-modal__diamond" aria-hidden="true">
          ◇
        </span>

        <p className="dress-modal__intro">{wedding.dressCodeIntro[lang]}</p>
        <p className="dress-modal__no-white">{wedding.dressCodeNoWhite[lang]}</p>

        <div className="dress-modal__hearts" role="list">
          {wedding.dressCodePalette.map((swatch) => (
            <button
              key={swatch.hex}
              type="button"
              role="listitem"
              className={`dress-modal__heart${selected?.hex === swatch.hex ? ' is-selected' : ''}`}
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
        <p className="dress-modal__swatch-name" aria-live="polite">
          {selected ? `${selected.name[lang]} · ${selected.hex.toUpperCase()}` : ' '}
        </p>

      </div>
    </Modal>
  );
}
