import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { I18nProvider } from './i18n/I18nProvider';
import { useI18n } from './i18n/useI18n';
import { ViewModeProvider, useViewMode } from './contexts/ViewModeContext';
import { Header } from './components/Header/Header';
import { Loader } from './components/Loader/Loader';
import { useViewportFlashlight } from './hooks/useViewportFlashlight';
import { GalleryMode } from './components/GalleryMode/GalleryMode';
import { Cave } from './sections/Cave';
import { ExitFlight } from './sections/ExitFlight';
import { Team } from './sections/Team';
import { Events } from './sections/Events';
import { Gallery } from './sections/Gallery';
import { Contact } from './sections/Contact';
import { Movie } from './sections/Movie';
import { NatureUrbanPlaceholder } from './sections/NatureUrbanPlaceholder';
import { scrollToId } from './utils/scroll';
import { initGsap, ScrollTrigger } from './animation/gsap';
import {
  ImmersionMotionStage,
  NATURE_TO_SKY,
  SKY_TO_CITY,
  useProximityPrewarm,
  useSequenceSceneController,
  type FrameSequenceDefinition,
  type SequenceCanvasHandle,
  type SequenceSceneBinding,
} from './motion';

// Initialize GSAP once at the top level
initGsap();

function ImmersionExperience({ isLoading }: { isLoading: boolean }) {
  const stageRef = useRef<SequenceCanvasHandle>(null);
  const natureMotionRef = useRef<HTMLElement>(null);
  const cityMotionRef = useRef<HTMLElement>(null);
  const activeSequenceRef = useRef<FrameSequenceDefinition>(NATURE_TO_SKY);
  const pendingProgressRef = useRef(0);
  const [activeSequence, setActiveSequence] = useState<FrameSequenceDefinition>(NATURE_TO_SKY);

  const motionScenes = useMemo<readonly SequenceSceneBinding[]>(
    () => [
      { targetRef: natureMotionRef, sequence: NATURE_TO_SKY },
      { targetRef: cityMotionRef, sequence: SKY_TO_CITY },
    ],
    [],
  );

  const activateSequence = useCallback((sequence: FrameSequenceDefinition, progress: number) => {
    pendingProgressRef.current = progress;
    stageRef.current?.activateSequence(sequence, progress);
    if (activeSequenceRef.current.id !== sequence.id) {
      activeSequenceRef.current = sequence;
      setActiveSequence(sequence);
    }
  }, []);

  const prewarmSequence = useCallback((
    sequence: FrameSequenceDefinition,
    target: React.RefObject<HTMLElement | null>,
  ) => {
    const rect = target.current?.getBoundingClientRect();
    const anticipatedProgress = rect && rect.top < 0 ? 1 : 0;
    stageRef.current?.prewarmSequence(sequence, anticipatedProgress);
  }, []);

  useSequenceSceneController(
    motionScenes,
    ({ sceneIndex, sequence, state }) => {
      stageRef.current?.setPortalOffset(sceneIndex === 0 ? state.portalOffset : 0);
      activateSequence(sequence, state.progress);
    },
    !isLoading,
  );

  useProximityPrewarm(natureMotionRef, () => prewarmSequence(NATURE_TO_SKY, natureMotionRef));
  useProximityPrewarm(cityMotionRef, () => prewarmSequence(SKY_TO_CITY, cityMotionRef));

  useEffect(() => {
    if (!isLoading) {
      ScrollTrigger.refresh();
      stageRef.current?.redraw();
    }
  }, [isLoading]);

  return (
    <>
      <Header />
      <ImmersionMotionStage
        ref={stageRef}
        sequence={activeSequence}
        initialProgress={pendingProgressRef.current}
      />
      <main style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
        <Cave isLoading={isLoading} />
        <ExitFlight ref={natureMotionRef} />
        <Team />
        <Events />
        <NatureUrbanPlaceholder ref={cityMotionRef} />
        <Gallery />
        <Movie />
        <Contact />
      </main>
    </>
  );
}

function AppContent() {
  useI18n();
  const { mode } = useViewMode();
  const [immersionLoaded, setImmersionLoaded] = useState(false);
  const prevModeRef = useRef(mode);

  if (prevModeRef.current !== mode) {
    prevModeRef.current = mode;
    if (mode === 'immersive') {
      setImmersionLoaded(false);
    }
  }

  const isLoading = mode === 'immersive' && !immersionLoaded;

  // Handle mode transition
  useEffect(() => {
    const handleModeChange = () => {
      // Force scroll to top when mode changes (especially for Gallery/Archive)
      window.scrollTo(0, 0);
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
        if (id && id !== 'archive' && id !== 'immersive') {
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
    const timer = setTimeout(initRefresh, 400);

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('load', initRefresh);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('load', initRefresh);
    };
  }, [isLoading, mode]);

  // One global viewport-stable flashlight (prevents scroll/pin-induced drift and flicker).
  useViewportFlashlight({
    enabled: mode === 'immersive' && !isLoading,
    radius: 520,
    touchRadius: 260,
    defaultPos: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.45 },
  });

  return (
    <div className="appRoot">
      {mode === 'immersive' && !immersionLoaded && (
        <Loader onLoaded={() => setImmersionLoaded(true)} />
      )}

      {/* Render based on mode */}
      <div className={`mode-content ${mode === 'gallery' ? 'mode-gallery' : 'mode-immersive'}`}>
        {mode === 'gallery' ? (
          <GalleryMode />
        ) : (
          <ImmersionExperience isLoading={isLoading} />
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


