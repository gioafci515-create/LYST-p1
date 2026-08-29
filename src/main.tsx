import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { InvitationProvider } from './context/InvitationContext';
import './styles/tokens.css';
import './styles/base.css';
import './styles/background.css';
import './styles/typography.css';
import './styles/animations.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <InvitationProvider>
        <App />
      </InvitationProvider>
    </LanguageProvider>
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);
