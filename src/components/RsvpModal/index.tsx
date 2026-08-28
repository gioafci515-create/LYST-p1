import { useRef, useState, type FormEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { wedding } from '../../data/wedding';
import {
  clearStoredRsvp,
  submitRsvp,
  storeRsvp,
  type Attendance,
  type RsvpData,
} from '../../lib/rsvp';
import { Modal } from '../Modal';
import { WaxSeal } from '../WaxSeal';
import './RsvpModal.css';

type Status = 'idle' | 'sending' | 'success' | 'error';
type ErrorKey = 'errName' | 'errSurname' | 'errAttendance' | 'errNetwork';

interface RsvpModalProps {
  initialSuccess: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function RsvpModal({ initialSuccess, onClose, onSubmitted }: RsvpModalProps) {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<RsvpData>({
    firstName: '',
    lastName: '',
    attendance: null,
    guestCount: 1,
    message: '',
    language: lang,
  });
  const [status, setStatus] = useState<Status>(initialSuccess ? 'success' : 'idle');
  const [error, setError] = useState<ErrorKey | null>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const attendanceRef = useRef<HTMLDivElement>(null);

  const setField = <K extends keyof RsvpData>(key: K, value: RsvpData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;

    if (!data.firstName.trim()) {
      setError('errName');
      firstNameRef.current?.focus();
      return;
    }
    if (!data.lastName.trim()) {
      setError('errSurname');
      lastNameRef.current?.focus();
      return;
    }
    if (!data.attendance) {
      setError('errAttendance');
      attendanceRef.current?.querySelector<HTMLElement>('button')?.focus();
      return;
    }

    setStatus('sending');
    setError(null);
    try {
      await submitRsvp({ ...data, language: lang });
      storeRsvp(data.attendance);
      setStatus('success');
      onSubmitted();
    } catch {
      setStatus('error');
      setError('errNetwork');
    }
  };

  const resetForResubmit = () => {
    clearStoredRsvp();
    setStatus('idle');
  };

  const showStepper = data.attendance === 'attending';

  return (
    <Modal titleId="rsvp-title" onClose={onClose}>
      {status === 'success' ? (
        <div className="rsvp-success">
          <WaxSeal size={72} />
          <p id="rsvp-title" className="section-heading rsvp-success__thanks">
            {t('thanks')}
          </p>
          <p className="rsvp-success__names">
            {wedding.groom[lang]} &amp; {wedding.bride[lang]}
          </p>
          <button type="button" className="rsvp-success__again" onClick={resetForResubmit}>
            {t('submitAgain')}
          </button>
        </div>
      ) : (
        <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
          <h2 id="rsvp-title" className="section-heading rsvp-form__title">
            {t('rsvpFormTitle')}
          </h2>

          <div className="rsvp-form__names">
            <label className="rsvp-form__field">
              <span className="rsvp-form__label">{t('firstName')}</span>
              <input
                ref={firstNameRef}
                type="text"
                value={data.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
                autoComplete="given-name"
                enterKeyHint="next"
                aria-invalid={error === 'errName'}
              />
            </label>
            <label className="rsvp-form__field">
              <span className="rsvp-form__label">{t('lastName')}</span>
              <input
                ref={lastNameRef}
                type="text"
                value={data.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                autoComplete="family-name"
                enterKeyHint="next"
                aria-invalid={error === 'errSurname'}
              />
            </label>
          </div>

          <div
            className="rsvp-form__attendance"
            ref={attendanceRef}
            role="radiogroup"
            aria-label={t('rsvpPrompt')}
            aria-invalid={error === 'errAttendance'}
          >
            {(['attending', 'not-attending'] as Attendance[]).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={data.attendance === option}
                className={`rsvp-form__choice${data.attendance === option ? ' is-selected' : ''}`}
                onClick={() => setField('attendance', option)}
              >
                {option === 'attending' ? t('attending') : t('notAttending')}
              </button>
            ))}
          </div>

          <div className={`rsvp-form__stepper-wrap${showStepper ? ' is-open' : ''}`}>
            <div className="rsvp-form__stepper-inner">
              <span className="rsvp-form__label" id="guest-count-label">
                {t('guestCount')}
              </span>
              <div
                className="rsvp-form__stepper"
                role="group"
                aria-labelledby="guest-count-label"
              >
                <button
                  type="button"
                  className="rsvp-form__step"
                  onClick={() => setField('guestCount', Math.max(1, data.guestCount - 1))}
                  disabled={data.guestCount <= 1}
                  aria-label="−"
                  tabIndex={showStepper ? 0 : -1}
                >
                  −
                </button>
                <span className="rsvp-form__count" aria-live="polite">
                  {data.guestCount}
                </span>
                <button
                  type="button"
                  className="rsvp-form__step"
                  onClick={() => setField('guestCount', Math.min(6, data.guestCount + 1))}
                  disabled={data.guestCount >= 6}
                  aria-label="+"
                  tabIndex={showStepper ? 0 : -1}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <label className="rsvp-form__field">
            <span className="rsvp-form__label">{t('message')}</span>
            <textarea
              rows={3}
              value={data.message}
              onChange={(e) => setField('message', e.target.value)}
            />
          </label>

          {error && (
            <p className="rsvp-form__error" role="alert">
              {t(error)}
            </p>
          )}

          <button
            type="submit"
            className="rsvp-form__submit"
            disabled={status === 'sending'}
          >
            <span className="rsvp-form__submit-seal">
              <WaxSeal size={64} />
              {status === 'sending' && <span className="rsvp-form__spinner" aria-hidden="true" />}
            </span>
            <span className="rsvp-form__submit-label">
              {status === 'sending' ? t('sending') : t('submit')}
            </span>
          </button>
        </form>
      )}
    </Modal>
  );
}
