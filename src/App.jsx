import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Globe, ExternalLink, MapPin } from 'lucide-react';
import { content } from './data/content';

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

  // --- State Management ---
  // Zoom state: 0 = default zoom, 1 = zoomed out (during fast panning)
  // Smooth transition over ~1 second: stiffness 100, damping 30 gives ~1s transition
  const zoomProgress = useMotionValue(0);
  const smoothZoomProgress = useSpring(zoomProgress, { stiffness: 100, damping: 30, mass: 1 });
  
  // Camera pan state (accumulated panning)
  const cameraPanX = useMotionValue(0);
  const cameraPanY = useMotionValue(0);
  
  // Track if mouse is moving
  const mouseMoving = useRef(false);
  const mouseMoveTimer = useRef(null);

  // --- Mobile Interaction Logic ---
  // Track if touch is moving
  const touchMoving = useRef(false);
  const touchMoveTimer = useRef(null);
  
  // Mobile pan state (same as desktop)
  const mobilePanX = useMotionValue(0);
  const mobilePanY = useMotionValue(0);

  // --- Calculated Values ---
  // Default zoom level (keep current initial zoom)
  const defaultScale = isMobile ? 0.75 : 1;
  // Zoom out to 0.8 during fast panning
  const scale = useTransform(smoothZoomProgress, [0, 1], [defaultScale, 0.8]);
  // Content opacity - show when panned away from center
  const contentOpacity = useTransform(() => {
    const panX = isMobile ? mobilePanX.get() : cameraPanX.get();
    const panY = isMobile ? mobilePanY.get() : cameraPanY.get();
    const distance = Math.sqrt(panX * panX + panY * panY);
    return Math.min(distance / 200, 1);
  });
  
  // Hint opacity - fade out as user pans away from center
  const hintOpacity = useTransform(() => {
    const panX = isMobile ? mobilePanX.get() : cameraPanX.get();
    const panY = isMobile ? mobilePanY.get() : cameraPanY.get();
    const distance = Math.sqrt(panX * panX + panY * panY);
    return Math.max(0, 1 - distance / 200);
  });
  
  // --- Mouse / Torch Logic ---
  // Initialize to center to avoid jump on load
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const smoothMouseX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const smoothMouseY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      // Track mouse movement
      mouseMoving.current = true;
      if (mouseMoveTimer.current) clearTimeout(mouseMoveTimer.current);
      mouseMoveTimer.current = setTimeout(() => {
        mouseMoving.current = false;
      }, 100);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseMoveTimer.current) clearTimeout(mouseMoveTimer.current);
    };
  }, [mouseX, mouseY, isMobile]);
  
  useEffect(() => {
     if (!isMobile) return;
     const handleTouchMove = (e) => {
        if (e.touches[0]) {
           mouseX.set(e.touches[0].clientX);
           mouseY.set(e.touches[0].clientY);
           
           // Track touch movement
           touchMoving.current = true;
           if (touchMoveTimer.current) clearTimeout(touchMoveTimer.current);
           touchMoveTimer.current = setTimeout(() => {
             touchMoving.current = false;
           }, 100);
        }
     };
     window.addEventListener('touchmove', handleTouchMove, { passive: false });
     return () => {
       window.removeEventListener('touchmove', handleTouchMove);
       if (touchMoveTimer.current) clearTimeout(touchMoveTimer.current);
     };
  }, [isMobile, mouseX, mouseY]);

  // --- Camera Logic ---
  
  // Edge-based panning: slow panning when not at edges, fast panning at edges (10% from screen edges)
  // Calculate max pan distance based on section dimensions
  // Largest section is 900px (Participants), screen needs to accommodate it
  // Max pan distance should allow section to fill screen
  // Use SECTION_OFFSET as base, add extra for filling
  const maxPanDistance = SECTION_OFFSET * 1.2;
  
  // Edge detection: 10% from screen edges
  const edgeThreshold = 0.1;
  
  // Panning logic - updates camera position based on mouse/touch position
  useEffect(() => {
    const updatePanning = () => {
      const mX = smoothMouseX.get();
      const mY = smoothMouseY.get();
      const centerX = winSize.w / 2;
      const centerY = winSize.h / 2;
      
      // Calculate distance from edges
      const distFromLeft = mX / winSize.w;
      const distFromRight = (winSize.w - mX) / winSize.w;
      const distFromTop = mY / winSize.h;
      const distFromBottom = (winSize.h - mY) / winSize.h;
      
      // Check if in edge zone (within 10% of any edge)
      const inEdgeZone = distFromLeft < edgeThreshold || 
                         distFromRight < edgeThreshold ||
                         distFromTop < edgeThreshold ||
                         distFromBottom < edgeThreshold;
      
      // Check if mouse/touch is at center (within small threshold)
      const mouseOffsetX = mX - centerX;
      const mouseOffsetY = mY - centerY;
      const distanceFromCenter = Math.sqrt(mouseOffsetX * mouseOffsetX + mouseOffsetY * mouseOffsetY);
      const centerThreshold = 20; // pixels
      const atCenter = distanceFromCenter < centerThreshold;
      
      // Determine if should pan
      let shouldPan = false;
      let panSpeed = 0;
      const isMoving = isMobile ? touchMoving.current : mouseMoving.current;
      
      if (inEdgeZone) {
        // Fast panning at edges (even if not moving)
        shouldPan = true;
        panSpeed = 0.3; // Fast panning speed (mid-zoom level)
        zoomProgress.set(1); // Zoom out during fast panning
      } else if (!atCenter && isMoving) {
        // Slow panning when not at edges and mouse/touch is moving
        shouldPan = true;
        panSpeed = 0.05; // Slow panning speed (max zoom level)
        zoomProgress.set(0); // Default zoom
      } else {
        // Stop panning: at center or not moving (and not at edges)
        shouldPan = false;
        zoomProgress.set(0); // Default zoom
      }
      
      if (shouldPan) {
        // Calculate pan direction (mouse right → content moves left → see right)
        const panDirectionX = (centerX - mX) * panSpeed;
        const panDirectionY = (centerY - mY) * panSpeed;
        
        // Get current pan position
        const currentPanX = isMobile ? mobilePanX.get() : cameraPanX.get();
        const currentPanY = isMobile ? mobilePanY.get() : cameraPanY.get();
        
        // Calculate new pan position
        let newPanX = currentPanX + panDirectionX;
        let newPanY = currentPanY + panDirectionY;
        
        // Clamp to max pan distance
        const distance = Math.sqrt(newPanX * newPanX + newPanY * newPanY);
        const maxDist = maxPanDistance;
        if (distance > maxDist) {
          const scale = maxDist / distance;
          newPanX *= scale;
          newPanY *= scale;
        }
        
        if (isMobile) {
          mobilePanX.set(newPanX);
          mobilePanY.set(newPanY);
        } else {
          cameraPanX.set(newPanX);
          cameraPanY.set(newPanY);
        }
      }
      
      requestAnimationFrame(updatePanning);
    };
    
    const animationId = requestAnimationFrame(updatePanning);
    return () => cancelAnimationFrame(animationId);
  }, [isMobile, winSize, smoothMouseX, smoothMouseY, cameraPanX, cameraPanY, mobilePanX, mobilePanY, zoomProgress, maxPanDistance]);
  
  const desktopCameraX = useTransform(() => {
    if (isMobile) return 0;
    return cameraPanX.get();
  });

  const desktopCameraY = useTransform(() => {
    if (isMobile) return 0;
    return cameraPanY.get();
  });
  
  // Mobile camera uses same pan state
  const mobileCameraX = useTransform(() => {
    if (!isMobile) return 0;
    return mobilePanX.get();
  });

  const mobileCameraY = useTransform(() => {
    if (!isMobile) return 0;
    return mobilePanY.get();
  });

  const finalCameraX = useTransform(() => isMobile ? mobileCameraX.get() : desktopCameraX.get());
  const finalCameraY = useTransform(() => isMobile ? mobileCameraY.get() : desktopCameraY.get());

  // Compass
  const compassRotation = useTransform(() => {
    const x = finalCameraX.get();
    const y = finalCameraY.get();
    if (x === 0 && y === 0) return 0;
    // Panning X negative means looking Right.
    // Compass should point to North relative to view?
    return Math.atan2(y, x) * (180 / Math.PI) + 90;
  });

  return (
    <>
      <div className="fixed inset-0 bg-black text-lu-text selection:bg-lu-gold selection:text-black overflow-hidden select-none h-[100dvh] touch-none">
      
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
        {isMobile ? "Touch to Explore • Move to Edges for Fast Panning" : "Move Mouse to Explore • Edges for Fast Panning"}
      </motion.div>

      {/* Layers */}
      <BackgroundLayer />
      <NoiseLayer mouseX={smoothMouseX} mouseY={smoothMouseY} isTouch={isMobile} isMobile={isMobile} />

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
          </motion.div>

        </motion.div>
      </div>

      <Compass rotation={compassRotation} />
      </div>
    </>
  );
};

export default App;
