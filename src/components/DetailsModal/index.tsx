import { useLanguage } from '../../context/LanguageContext';
import { wedding } from '../../data/wedding';
import { Modal } from '../Modal';
import './DetailsModal.css';

interface DetailsModalProps {
  onClose: () => void;
}

export function DetailsModal({ onClose }: DetailsModalProps) {
  const { lang, t } = useLanguage();

  return (
    <Modal titleId="details-title" onClose={onClose}>
      <div className="details-modal">
        <h2 id="details-title" className="section-heading details-modal__date">
          {wedding.displayDate[lang]}
        </h2>

        <ol className="details-modal__timeline">
          {wedding.schedule.map((item) => (
            <li key={item.time} className="details-modal__entry">
              <span className="details-modal__time">{item.time}</span>
              <span className="details-modal__event">{item.title[lang]}</span>
            </li>
          ))}
        </ol>

        <p className="details-modal__venue">{wedding.venue[lang]}</p>

        <a
          className="details-modal__map teaser-cta"
          href={wedding.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('openLocation')}
        </a>
      </div>
    </Modal>
  );
}
