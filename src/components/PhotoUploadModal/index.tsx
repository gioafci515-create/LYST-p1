import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { uploadPhotos } from '../../lib/photos';
import { Modal } from '../Modal';
import { WaxSeal } from '../WaxSeal';
import './PhotoUploadModal.css';

type Status = 'idle' | 'sending' | 'success' | 'error';
type ErrorKey = 'photoErrNone' | 'photoErrSome' | 'photoErrAll';

interface PhotoUploadModalProps {
  onClose: () => void;
}

export function PhotoUploadModal({ onClose }: PhotoUploadModalProps) {
  const { t } = useLanguage();
  const [guestName, setGuestName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<ErrorKey | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  /** Appends rather than replaces — tapping "take a photo" a few times in
   *  a row, or taking one then also picking from the gallery, should
   *  build up one batch, not throw away what's already chosen. Clearing
   *  the input's own value lets the exact same shot be captured again. */
  const appendFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length > 0) setFiles((prev) => [...prev, ...picked]);
    event.target.value = '';
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;
    if (files.length === 0) {
      setError('photoErrNone');
      return;
    }

    setStatus('sending');
    setError(null);
    const results = await uploadPhotos(files, guestName.trim());
    const failed = results.filter((r) => !r.ok).length;

    if (failed === results.length) {
      setStatus('error');
      setError('photoErrAll');
      return;
    }
    if (failed > 0) {
      setError('photoErrSome');
    }
    setStatus('success');
  };

  const resetForMore = () => {
    setFiles([]);
    setStatus('idle');
    setError(null);
  };

  return (
    <Modal titleId="photo-upload-title" onClose={onClose}>
      {status === 'success' ? (
        <div className="photo-upload-success">
          <WaxSeal size={72} />
          <p id="photo-upload-title" className="section-heading photo-upload-success__thanks">
            {t('photoSuccess')}
          </p>
          {error === 'photoErrSome' && (
            <p className="photo-upload-form__error" role="alert">
              {t(error)}
            </p>
          )}
          <button type="button" className="photo-upload-success__again" onClick={resetForMore}>
            {t('photoUploadMore')}
          </button>
        </div>
      ) : (
        <form className="photo-upload-form" onSubmit={handleSubmit} noValidate>
          <h2 id="photo-upload-title" className="section-heading photo-upload-form__title">
            {t('photoModalTitle')}
          </h2>

          <label className="photo-upload-form__field">
            <span className="photo-upload-form__label">{t('photoNameLabel')}</span>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoComplete="name"
              enterKeyHint="next"
            />
          </label>

          <div className="photo-upload-form__choices">
            <div className="photo-upload-form__choice-item">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={appendFiles}
                className="photo-upload-form__input"
                id="photo-upload-camera"
              />
              <label htmlFor="photo-upload-camera" className="photo-upload-form__choose">
                {t('photoTakePhoto')}
              </label>
            </div>
            <div className="photo-upload-form__choice-item">
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={appendFiles}
                className="photo-upload-form__input"
                id="photo-upload-gallery"
              />
              <label htmlFor="photo-upload-gallery" className="photo-upload-form__choose">
                {t('photoFromGallery')}
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <p className="photo-upload-form__count" aria-live="polite">
              {t('photoChosenCount').replace('{n}', String(files.length))}
            </p>
          )}

          {error && (
            <p className="photo-upload-form__error" role="alert">
              {t(error)}
            </p>
          )}

          <button type="submit" className="photo-upload-form__submit" disabled={status === 'sending'}>
            <span className="photo-upload-form__submit-seal">
              <WaxSeal size={64} />
              {status === 'sending' && <span className="photo-upload-form__spinner" aria-hidden="true" />}
            </span>
            <span className="photo-upload-form__submit-label">
              {status === 'sending' ? t('photoUploading') : t('submit')}
            </span>
          </button>
        </form>
      )}
    </Modal>
  );
}
