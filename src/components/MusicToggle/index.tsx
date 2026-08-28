import { useLanguage } from '../../context/LanguageContext';
import './MusicToggle.css';

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

/** Vinyl disc pair from the assets folder: play face when paused, pause
 *  face while playing (spinning). */
export function MusicToggle({ isPlaying, onToggle }: MusicToggleProps) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="music-toggle"
      onClick={onToggle}
      aria-label={isPlaying ? t('musicOff') : t('musicOn')}
      aria-pressed={isPlaying}
    >
      <img
        src={isPlaying ? 'assets/vinyl-pause.png' : 'assets/vinyl-play.png'}
        width={200}
        height={143}
        alt=""
        aria-hidden="true"
        className={`music-toggle__vinyl${isPlaying ? ' is-spinning' : ''}`}
      />
    </button>
  );
}
