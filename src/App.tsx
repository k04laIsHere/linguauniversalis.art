import { useEffect, useState } from 'react';
import { I18nProvider } from './i18n/I18nProvider';
import { useI18n } from './i18n/useI18n';
import { ViewModeProvider, useViewMode } from './contexts/ViewModeContext';
import { Header } from './components/Header/Header';
import { NatureBackdrop } from './components/Backdrops/NatureBackdrop';
import { UrbanBackdrop } from './components/Backdrops/UrbanBackdrop';
import { BackdropController } from './components/Backdrops/BackdropController';
import { Loader } from './components/Loader/Loader';
import { useViewportFlashlight } from './hooks/useViewportFlashlight';
import { GalleryMode } from './components/GalleryMode/GalleryMode';
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
  const { mode } = useViewMode();
  const [isLoading, setIsLoading] = useState(true);
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle mode transition
  useEffect(() => {
    const handleModeChange = () => {
      setIsTransitioning(true);
      document.body.style.overflow = 'hidden'; // Pause during transition

      // Fade out
      setTimeout(() => {
        // Mode has changed, now fade in
        setTimeout(() => {
          setIsTransitioning(false);
          document.body.style.overflow = ''; // Resume scrolling
        }, 500); // Wait for fade-in
      }, 500); // Wait for fade-out
    };

    // Listen for mode changes by checking a custom event
    window.addEventListener('mode-change', handleModeChange);
    return () => window.removeEventListener('mode-change', handleModeChange);
  }, []);

  // Trigger mode-change event when mode changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mode-change'));
  }, [mode]);

  // Handle hash navigation
  useEffect(() => {
    if (isLoading) return; // Don't handle hash until loaded

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
    const timer = setTimeout(initRefresh, 1000);

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('load', initRefresh);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('load', initRefresh);
    };
  }, [isLoading]);

  // One global viewport-stable flashlight (prevents scroll/pin-induced drift and flicker).
  useViewportFlashlight({
    enabled: !reduced && !isLoading,
    radius: 520,
    touchRadius: 760,
    defaultPos: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.45 },
  });

  return (
    <div className="appRoot">
      <Loader onLoaded={() => setIsLoading(false)} />

      {/* Mode Transition Overlay */}
      {isTransitioning && (
        <div
          className="mode-transition-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: '#ffffff',
            zIndex: 9999,
            animation: 'modeFade 1s ease-in-out forwards',
          }}
        />
      )}

      {/* Render based on mode */}
      <div className={`mode-content ${mode === 'gallery' ? 'mode-gallery' : 'mode-immersive'}`}>
        {mode === 'gallery' ? (
          <GalleryMode />
        ) : (
          <>
            <Header />
            <NatureBackdrop />
            <UrbanBackdrop />
            <main style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
              <Cave />
              <ExitFlight />
              <Team />
              <Events />
              <NatureUrbanPlaceholder />
              <Gallery />
              <Contact />
            </main>
            {!isLoading && <BackdropController />}
          </>
        )}
      </div>

      <style>{`
        @keyframes modeFade {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }

        .mode-content {
          transition: opacity 0.5s ease;
        }

        .mode-immersive {
          animation: fadeIn 0.5s ease-in-out;
        }

        .mode-gallery {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <ViewModeProvider>
        <AppContent />
      </ViewModeProvider>
    </I18nProvider>
  );
}


