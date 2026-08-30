import { useState } from 'react';
import { readStoredRsvp } from '../../lib/rsvp';
import { wedding } from '../../data/wedding';
import { IntroSection } from '../IntroSection';
import { PhotoSection } from '../PhotoSection';
import { DetailsTeaser } from '../DetailsTeaser';
import { DetailsModal } from '../DetailsModal';
import { DressCodeModal } from '../DressCodeModal';
import { BackToTop } from '../BackToTop';
import { RsvpTeaser } from '../RsvpTeaser';
import { RsvpModal } from '../RsvpModal';
import { PhotoTeaser } from '../PhotoTeaser';
import { PhotoUploadModal } from '../PhotoUploadModal';
import { Countdown } from '../Countdown';
import { CountdownErrorBoundary } from '../Countdown/ErrorBoundary';
import { useLanguage } from '../../context/LanguageContext';
import { Footer } from '../Footer';
import './Invitation.css';

type OpenModal = 'details' | 'rsvp' | 'photos' | null;

/** STATE 3+: the scrollable invitation and its two overlay modals. */
export function Invitation() {
  const { lang } = useLanguage();
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [dressCodeOpen, setDressCodeOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(() => readStoredRsvp() !== null);

  return (
    <main className="invitation">
      <IntroSection />
      <PhotoSection photo={wedding.photos.photo1} altKey="photoAlt1" />
      <DetailsTeaser onOpen={() => setOpenModal('details')} />
      <PhotoSection photo={wedding.photos.photo2} altKey="photoAlt2" />
      <RsvpTeaser hasSubmitted={hasSubmitted} onOpen={() => setOpenModal('rsvp')} />
      <PhotoTeaser onOpen={() => setOpenModal('photos')} />
      <CountdownErrorBoundary
        fallback={
          <p className="section date-line" style={{ textAlign: 'center' }}>
            {wedding.displayDate[lang]}
          </p>
        }
      >
        <Countdown />
      </CountdownErrorBoundary>
      <Footer />

      <BackToTop modalOpen={openModal !== null || dressCodeOpen} />

      {openModal === 'details' && (
        <DetailsModal
          onClose={() => setOpenModal(null)}
          onOpenDressCode={() => setDressCodeOpen(true)}
        />
      )}
      {dressCodeOpen && <DressCodeModal onClose={() => setDressCodeOpen(false)} />}
      {openModal === 'rsvp' && (
        <RsvpModal
          initialSuccess={hasSubmitted}
          onClose={() => setOpenModal(null)}
          onSubmitted={() => setHasSubmitted(true)}
        />
      )}
      {openModal === 'photos' && <PhotoUploadModal onClose={() => setOpenModal(null)} />}
    </main>
  );
}
