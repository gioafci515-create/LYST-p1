import { useLanguage } from '../../context/LanguageContext';
import './EventNotice.css';

/** Small formal notice sitting right above the RSVP section. */
export function EventNotice() {
  const { t } = useLanguage();

  return (
    <p className="event-notice" data-reveal="fade">
      {t('eventNotice')}
    </p>
  );
}
