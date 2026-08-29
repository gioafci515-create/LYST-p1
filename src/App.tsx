import { lazy, Suspense, useCallback } from 'react';
import { useInvitation } from './context/InvitationContext';
import { useLanguage } from './context/LanguageContext';
import { useLockBodyScroll } from './hooks/useLockBodyScroll';
import { useHashRoute } from './hooks/useHashRoute';
import { useAudio } from './hooks/useAudio';
import { useRevealEngine } from './hooks/useRevealEngine';
import { wedding } from './data/wedding';
import { logInvitationOpen } from './lib/supabase';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { MusicToggle } from './components/MusicToggle';
import { InvitationGate } from './components/InvitationGate';
import { Invitation } from './components/Invitation';
import { ScrollProgress } from './components/ScrollProgress';

const AdminPage = lazy(() =>
  import('./components/Admin').then((m) => ({ default: m.AdminPage })),
);

export default function App() {
  const route = useHashRoute();
  const { isOpened } = useInvitation();
  const { lang } = useLanguage();
  const { isPlaying, audioAvailable, start, toggle } = useAudio(wedding.music);

  const isAdmin = route === '#/admin';

  useLockBodyScroll(!isAdmin && !isOpened);
  useRevealEngine();

  const handleOpenAudio = useCallback(() => start(), [start]);
  const handleOpened = useCallback(() => logInvitationOpen(lang), [lang]);

  if (isAdmin) {
    return (
      <>
        <div className="bg-gradient" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />
        <LanguageSwitcher />
        <Suspense fallback={null}>
          <AdminPage />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <div className="bg-gradient" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />
      <div className="bg-noise--coarse" aria-hidden="true" />
      <LanguageSwitcher />
      {isOpened && <ScrollProgress />}
      <Invitation />
      {!isOpened && <InvitationGate onOpenAudio={handleOpenAudio} onOpened={handleOpened} />}
      {isOpened && audioAvailable && <MusicToggle isPlaying={isPlaying} onToggle={toggle} />}
    </>
  );
}
