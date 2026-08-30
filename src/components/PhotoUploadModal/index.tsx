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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files ?? []));
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

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFiles}
            className="photo-upload-form__input"
            id="photo-upload-input"
          />
          <label htmlFor="photo-upload-input" className="photo-upload-form__choose">
            {t('photoChoose')}
          </label>

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
