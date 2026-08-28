import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import './Modal.css';

interface ModalProps {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  /** extra class on the panel, e.g. paper variant for the dress code */
  panelClassName?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

/** Stack so Escape only closes the topmost modal when they nest. */
const modalStack: symbol[] = [];

/** Shared shell: portal, focus trap, Escape, backdrop click. */
export function Modal({ titleId, onClose, children, panelClassName }: ModalProps) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const idRef = useRef<symbol>();
  if (!idRef.current) idRef.current = Symbol('modal');

  useLockBodyScroll(true);

  useEffect(() => {
    const id = idRef.current!;
    modalStack.push(id);
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => {
      const index = modalStack.indexOf(id);
      if (index !== -1) modalStack.splice(index, 1);
      restoreFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isTop = modalStack[modalStack.length - 1] === idRef.current;
      if (!isTop) return;
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const root = document.getElementById('modal-root');
  if (!root) return null;

  return createPortal(
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose} />
      <div
        className={`modal__panel${panelClassName ? ` ${panelClassName}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label={t('close')}>
          ×
        </button>
        {children}
      </div>
    </div>,
    root,
  );
}
