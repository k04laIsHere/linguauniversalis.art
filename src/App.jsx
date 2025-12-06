import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Globe, ExternalLink, MapPin } from 'lucide-react';
import { content } from './data/content';

// Import new navigation system
import { useScrollTimeline } from './hooks/useScrollTimeline';
import { useFlashlightScanner } from './hooks/useFlashlightScanner';
import { animateToSection } from './utils/navigationAnimation';
import { SCROLL_PATH, getPositionFromScroll } from './utils/scrollPath';
import { FRICTION_STATES, getZoomProgress } from './utils/frictionStates';
import { NavigationNodes } from './components/NavigationNode';
import { AccessibilityMode } from './components/AccessibilityMode';

// Import assets
import heroBg from '../assets/images/background.jpg';

// --- Constants ---
const SECTION_OFFSET = 1500; // Distance of sections from center (0,0)

// --- Components ---

const NoiseLayer = ({ mouseX, mouseY, isTouch, isMobile }) => {
  // Desktop: 450px, Mobile: 250px
  const radius = isTouch || isMobile ? 250 : 450;

  // Use motion template for performant mask updates
  const maskImage = useMotionTemplate`radial-gradient(circle ${radius}px at ${mouseX}px ${mouseY}px, transparent 0%, black 100%)`;

  return (
    <motion.div
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{
        maskImage,
        WebkitMaskImage: maskImage,
        backdropFilter: 'blur(5px)'
      }}
    >
        <div className="absolute inset-0 bg-noise opacity-[0.2] animate-grain mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-black/90"></div>
    </motion.div>
  );
};

const BackgroundLayer = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-40"
      style={{ backgroundImage: `url(${heroBg})` }}
    />
    <div className="absolute inset-0 bg-black/60" />
  </div>
);

// Reusing existing content components with minimal tweaks for spatial layout
const Manifesto = ({ t }) => (
  <div className="max-w-2xl mx-auto text-center p-8 bg-black/80 border border-lu-gold/20 backdrop-blur-md">
    <h2 className="font-serif text-4xl text-lu-gold mb-8">{t.about.title}</h2>
    <div className="space-y-6 font-light text-lg text-gray-300">
      {t.about.text.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  </div>
);

const Participants = ({ t }) => (
  <div className="max-w-4xl mx-auto p-8">
    <h2 className="font-serif text-4xl text-lu-gold mb-12 text-center">{t.participants.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {t.participants.list.map((p, i) => (
        <div key={i} className="bg-black/80 border border-white/10 p-6 hover:border-lu-gold/50 transition-colors">
          <div className="aspect-[4/5] mb-4 overflow-hidden">
            <img src={p.img} alt={p.name} className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700" />
          </div>
          <h3 className="font-serif text-xl text-white">{p.name}</h3>
          <p className="text-xs text-lu-gold uppercase tracking-wider mt-1">{p.role}</p>
        </div>
      ))}
    </div>
  </div>
);

const Events = ({ t }) => (
  <div className="max-w-2xl mx-auto p-8 bg-black/80 border border-lu-gold/20 backdrop-blur-md">
    <h2 className="font-serif text-4xl text-lu-gold mb-8 text-center">{t.events.title}</h2>
    <div className="space-y-8">
      {t.events.list.map((e, i) => (
        <div key={i} className="border-b border-white/10 pb-8 last:border-0">
          <h3 className="font-serif text-2xl text-white mb-2">{e.title}</h3>
          <div className="flex items-center gap-2 text-sm text-lu-gold mb-4">
            <MapPin size={14} />
            <span>{e.location}</span>
          </div>
          <p className="text-gray-400 font-light mb-4">{e.desc}</p>
          <a href={e.link} target="_blank" rel="noreferrer" className="text-xs uppercase tracking-widest hover:text-lu-gold transition-colors flex items-center gap-2">
            Details <ExternalLink size={12} />
          </a>
        </div>
      ))}
    </div>
  </div>
);

const Contact = ({ t }) => (
  <div className="max-w-xl mx-auto p-8 bg-black/80 border border-lu-gold/20 backdrop-blur-md text-center">
    <h2 className="font-serif text-4xl text-lu-gold mb-8">{t.nav.contacts}</h2>
    <div className="space-y-4 text-gray-300 font-light">
      <p className="text-xl">{t.footer.contacts}</p>
      <p className="text-sm opacity-60">{t.footer.text}</p>
      <div className="pt-8">
        <a href="mailto:info@linguauniversalis.art" className="inline-block border border-lu-gold px-8 py-3 text-xs uppercase tracking-widest hover:bg-lu-gold hover:text-black transition-colors">
          Email Us
        </a>
      </div>
    </div>
  </div>
);

const Compass = ({ rotation }) => (
  <motion.div
    className="fixed bottom-8 right-8 w-16 h-16 border border-white/10 rounded-full z-50 flex items-center justify-center backdrop-blur-sm pointer-events-none hidden md:flex"
    style={{ rotate: rotation }}
  >
    <div className="w-full h-[1px] bg-white/20 absolute" />
    <div className="h-full w-[1px] bg-white/20 absolute" />
    <div className="w-2 h-2 bg-lu-gold rounded-full" />
    <div className="absolute top-1 text-[8px] text-lu-gold">N</div>
  </motion.div>
);

const App = () => {
  const [lang, setLang] = useState('ru');
  const t = content[lang];

  // Window dimensions
  const [winSize, setWinSize] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1000, h: typeof window !== 'undefined' ? window.innerHeight : 800 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- NEW: Scroll-based Navigation System ---

  // Scroll timeline hook
  const {
    scrollPosition,
    scrollProgress,
    frictionState,
    currentSection,
    flashlightScanProgress,
    scrollToPosition,
  } = useScrollTimeline(isMobile);

  // Calculate camera position from scroll progress
  const cameraPosition = useTransform(scrollProgress, (progress) => {
    const pos = getPositionFromScroll(progress * SCROLL_PATH.totalDistance);
    return pos;
  });

  const finalCameraX = useTransform(cameraPosition, (pos) => -pos.x); // Invert for camera movement
  const finalCameraY = useTransform(cameraPosition, (pos) => -pos.y); // Invert for camera movement

  // Zoom out during travel state
  const zoomProgressTarget = useMotionValue(0);

  useEffect(() => {
    const target = getZoomProgress(frictionState);
    zoomProgressTarget.set(target);
  }, [frictionState, zoomProgressTarget]);

  const smoothZoomProgress = useSpring(zoomProgressTarget, { stiffness: 50, damping: 25, mass: 1 });

  // Default zoom level (keep current initial zoom)
  const defaultScale = isMobile ? 0.75 : 1;
  // Zoom out during fast panning: desktop 1.0 -> 0.8, mobile 0.75 -> 0.6
  const zoomOutScale = isMobile ? 0.6 : 0.8;
  const scale = useTransform(smoothZoomProgress, [0, 1], [defaultScale, zoomOutScale]);

  // Content opacity - show when panned away from center
  const contentOpacity = useTransform(() => {
    const progress = scrollProgress.get();
    // Fade in content as we move away from initial position
    return Math.min(progress * 5, 1); // Fast fade-in
  });

  // Hint opacity - fade out as user scrolls
  const hintOpacity = useTransform(() => {
    const progress = scrollProgress.get();
    return Math.max(0, 1 - progress * 5); // Fast fade-out
  });

  // --- Mouse / Touch Tracking (for flashlight) ---
  // Initialize to center to avoid jump on load
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const smoothMouseX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const smoothMouseY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  // Track previous mouse position to detect significant movement
  const prevMouseX = useRef(0);
  const prevMouseY = useRef(0);
  const mouseMovementThreshold = 5; // pixels

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      const newX = e.clientX;
      const newY = e.clientY;

      // Check if movement is significant
      const deltaX = Math.abs(newX - prevMouseX.current);
      const deltaY = Math.abs(newY - prevMouseY.current);
      const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (movement > mouseMovementThreshold) {
        mouseX.set(newX);
        mouseY.set(newY);
        prevMouseX.current = newX;
        prevMouseY.current = newY;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY, isMobile]);

  // Track previous touch position
  const prevTouchX = useRef(0);
  const prevTouchY = useRef(0);
  const touchMovementThreshold = 5; // pixels

  useEffect(() => {
     if (!isMobile) return;
     const handleTouchMove = (e) => {
        if (e.touches[0]) {
           const newX = e.touches[0].clientX;
           const newY = e.touches[0].clientY;

           // Check if movement is significant
           const deltaX = Math.abs(newX - prevTouchX.current);
           const deltaY = Math.abs(newY - prevTouchY.current);
           const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

           if (movement > touchMovementThreshold) {
             mouseX.set(newX);
             mouseY.set(newY);
             prevTouchX.current = newX;
             prevTouchY.current = newY;
           }
        }
     };
     window.addEventListener('touchmove', handleTouchMove, { passive: true });
     return () => {
       window.removeEventListener('touchmove', handleTouchMove);
     };
  }, [isMobile, mouseX, mouseY]);

  // --- Flashlight Scanner System ---
  const { flashlightX, flashlightY } = useFlashlightScanner({
    isMobile,
    frictionState,
    currentSection,
    flashlightScanProgress,
    mouseX: smoothMouseX,
    mouseY: smoothMouseY,
    finalCameraX,
    finalCameraY,
    winSize,
  });

  // --- Navigation Handler ---
  const handleNavigateToSection = useCallback((section) => {
    animateToSection(
      scrollProgress,
      scrollToPosition,
      section,
      () => {
        // Animation complete
        console.log('Navigated to', section.name);
      }
    );
  }, [scrollProgress, scrollToPosition]);

  // --- Accessibility Mode ---
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  // Compass rotation
  const compassRotation = useTransform(() => {
    const x = finalCameraX.get();
    const y = finalCameraY.get();
    if (x === 0 && y === 0) return 0;
    return Math.atan2(y, x) * (180 / Math.PI) + 90;
  });

  return (
    <>
      <div className="fixed inset-0 bg-black text-lu-text selection:bg-lu-gold selection:text-black overflow-hidden select-none h-[100dvh] touch-none">

      {/* Text Version Toggle (Top Left) */}
      <button
        onClick={() => setAccessibilityMode(!accessibilityMode)}
        className="fixed top-8 left-8 z-[200] text-xs uppercase tracking-widest text-white/50 hover:text-lu-gold transition-colors pointer-events-auto"
        aria-label="Toggle text-only mode"
      >
        Text Version
      </button>

      {/* Language Switcher */}
      <div className="fixed top-8 right-8 z-[200] mix-blend-difference pointer-events-auto">
         <button
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            className="flex items-center gap-2 text-xs tracking-[0.2em] text-white hover:text-lu-gold transition-colors uppercase font-light"
          >
            <Globe size={14} />
            {lang}
          </button>
      </div>

      {/* Hint */}
      <motion.div
        className="fixed bottom-8 left-0 w-full text-center z-[50] text-white/30 text-[10px] uppercase tracking-[0.3em] pointer-events-none"
        style={{ opacity: hintOpacity }}
      >
        {isMobile ? "Swipe to Navigate • Scroll at Sections to Explore" : "Scroll to Navigate • Camera Locks at Sections"}
      </motion.div>

      {/* Layers */}
      <BackgroundLayer />
      <NoiseLayer mouseX={flashlightX} mouseY={flashlightY} isTouch={isMobile} isMobile={isMobile} />

      {/* Spatial Canvas */}
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
        <motion.div
          className="relative w-0 h-0 flex items-center justify-center"
          style={{
            scale,
            x: finalCameraX,
            y: finalCameraY,
            transformOrigin: 'center center'
          }}
        >
          {/* Center: Title (Always Visible) */}
          <div className="absolute inset-0 flex items-center justify-center w-[100vw] h-[100vh] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
             <div className="text-center">
                <motion.h1
                  className="font-serif text-6xl md:text-9xl tracking-widest text-white drop-shadow-2xl whitespace-nowrap"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5 }}
                >
                  LINGUA<br />UNIVERSALIS
                </motion.h1>
                <motion.p
                  className="font-sans text-sm tracking-[0.5em] text-lu-gold uppercase mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  {t.hero.subtitle}
                </motion.p>
             </div>
          </div>

          {/* Peripheral Content (Fades in on Scroll) */}
          <motion.div style={{ opacity: contentOpacity }}>
            {/* North: Manifesto */}
            <div
              className="absolute w-[80vw] md:w-[600px] pointer-events-auto flex flex-col items-center"
              style={{ transform: `translate(-50%, -${SECTION_OFFSET}px)` }}
            >
               <Manifesto t={t} />
               <div className="h-32 w-[1px] bg-gradient-to-b from-transparent to-lu-gold/50 mt-8"></div>
            </div>

            {/* East: Participants */}
            <div
              className="absolute w-[80vw] md:w-[900px] pointer-events-auto"
              style={{ transform: `translate(${SECTION_OFFSET * 0.8}px, -50%)` }}
            >
              <Participants t={t} />
            </div>

            {/* South: Events */}
            <div
              className="absolute w-[80vw] md:w-[600px] pointer-events-auto flex flex-col-reverse items-center"
              style={{ transform: `translate(-50%, ${SECTION_OFFSET * 0.8}px)` }}
            >
               <Events t={t} />
               <div className="h-32 w-[1px] bg-gradient-to-t from-transparent to-lu-gold/50 mb-8"></div>
            </div>

             {/* West: Contact */}
             <div
              className="absolute w-[80vw] md:w-[500px] pointer-events-auto"
              style={{ transform: `translate(-${SECTION_OFFSET}px, -50%)` }}
            >
              <Contact t={t} />
            </div>

            {/* Connection Lines */}
            <svg className="absolute top-0 left-0 overflow-visible opacity-20 pointer-events-none" style={{ width: 1, height: 1 }}>
               <circle cx="0" cy="0" r={SECTION_OFFSET} fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
               <line x1="0" y1="0" x2="0" y2={`-${SECTION_OFFSET}`} stroke="white" />
               <line x1="0" y1="0" x2={`-${SECTION_OFFSET}`} y2="0" stroke="white" />
               <line x1="0" y1="0" x2="0" y2={`${SECTION_OFFSET}`} stroke="white" />
               <line x1="0" y1="0" x2={`${SECTION_OFFSET}`} y2="0" stroke="white" />
            </svg>

            {/* Navigation Nodes (visible when zoomed out) */}
            <motion.div style={{ opacity: smoothZoomProgress }}>
              <NavigationNodes
                sections={SCROLL_PATH.sections.filter(s => !s.id.includes('return'))} // Exclude return section
                currentSection={currentSection}
                isVisible={true} // Controlled by parent opacity
                onNavigate={handleNavigateToSection}
              />
            </motion.div>
          </motion.div>

        </motion.div>
      </div>

      <Compass rotation={compassRotation} />

      {/* Accessibility Mode Overlay */}
      <AccessibilityMode
        isActive={accessibilityMode}
        onClose={() => setAccessibilityMode(false)}
        content={t}
        lang={lang}
      />
      </div>
    </>
  );
};

export default App;
