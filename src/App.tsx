import { I18nProvider } from './i18n/I18nProvider';
import { useI18n } from './i18n/useI18n';
import { Header } from './components/Header/Header';
import { NatureBackdrop } from './components/Backdrops/NatureBackdrop';
import { UrbanBackdrop } from './components/Backdrops/UrbanBackdrop';
import { BackdropController } from './components/Backdrops/BackdropController';
import { useViewportFlashlight } from './hooks/useViewportFlashlight';
import { Whispers } from './components/Whispers/Whispers';
import { Cave } from './sections/Cave';
import { ExitFlight } from './sections/ExitFlight';
import { Team } from './sections/Team';
import { Events } from './sections/Events';
import { Gallery } from './sections/Gallery';
import { Contact } from './sections/Contact';
import { NatureUrbanPlaceholder } from './sections/NatureUrbanPlaceholder';

function AppContent() {
  const { lang } = useI18n();
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  // One global viewport-stable flashlight (prevents scroll/pin-induced drift and flicker).
  useViewportFlashlight({
    enabled: !reduced,
    radius: 520,
    touchRadius: 760,
    defaultPos: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.45 },
  });

  return (
    <div className="appRoot">
      <Header />
      <Whispers lang={lang} />
      <NatureBackdrop />
      <UrbanBackdrop />
      <BackdropController />
      <main>
        <Cave />
        <ExitFlight />
        <Team />
        <Events />
        <NatureUrbanPlaceholder />
        <Gallery />
        <Contact />
      </main>
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}


