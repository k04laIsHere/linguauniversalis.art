import { useEffect } from 'react';
import { I18nProvider } from './i18n/I18nProvider';
import { useI18n } from './i18n/useI18n';
import { Header } from './components/Header/Header';
import { NatureBackdrop } from './components/Backdrops/NatureBackdrop';
import { UrbanBackdrop } from './components/Backdrops/UrbanBackdrop';
import { BackdropController } from './components/Backdrops/BackdropController';
import { useViewportFlashlight } from './hooks/useViewportFlashlight';
import { Cave } from './sections/Cave';
import { ExitFlight } from './sections/ExitFlight';
import { Team } from './sections/Team';
import { Events } from './sections/Events';
import { Gallery } from './sections/Gallery';
import { Contact } from './sections/Contact';
import { NatureUrbanPlaceholder } from './sections/NatureUrbanPlaceholder';
import { scrollToId } from './utils/scroll';
import { initGsap, ScrollTrigger } from './animation/gsap';

// Initialize GSAP once at the top level
initGsap();

function AppContent() {
  const { lang } = useI18n();
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  // Handle hash navigation
  useEffect(() => {
    // Force refresh on initial load
    const initRefresh = () => {
      ScrollTrigger.refresh();
      handleHash();
    };

    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.split('?')[0].replace('#', '');
        if (id) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            // If we are not at the section, scroll to it
            if (Math.abs(rect.top - 110) > 100) {
              scrollToId(id);
            }
          }
        }
      }
    };

    // Wait for all sections to mount and images to potentially load
    const timer = setTimeout(initRefresh, 1500);

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('load', initRefresh);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('load', initRefresh);
    };
  }, []);

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
      <NatureBackdrop />
      <UrbanBackdrop />
      <main>
        <Cave />
        <ExitFlight />
        <Team />
        <Events />
        <NatureUrbanPlaceholder />
        <Gallery />
        <Contact />
      </main>
      <BackdropController />
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


