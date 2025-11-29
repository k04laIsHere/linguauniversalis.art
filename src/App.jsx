import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
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
  const progress = useMotionValue(0); // 0 = Center (Zoom In), 1 = Zoom Out
  const smoothProgress = useSpring(progress, { stiffness: 100, damping: 30, mass: 1 });
  
  // --- Desktop Scroll Logic ---
  const { scrollY } = useScroll();

  // Sync scrollY to progress (Desktop)
  useEffect(() => {
    if (isMobile) return;
    return scrollY.on("change", (latest) => {
      const newProgress = Math.min(Math.max(latest / 1500, 0), 1);
      progress.set(newProgress);
    });
  }, [scrollY, isMobile, progress]);

  // --- Mobile Interaction Logic ---
  const touchStart = useRef({ x: 0, y: 0 });
  // Mobile specific state
  const mobilePanX = useMotionValue(0);
  const mobilePanY = useMotionValue(0);
  const resetTimer = useRef(null);
  const isInteracting = useRef(false);

  // Reset to center animation loop
  const resetToCenterMobile = useCallback(() => {
    // Animate back to center state (zoom in, center pan)
    const animateReset = () => {
        if (isInteracting.current) return; // Stop if user interrupts
        
        let needsUpdate = false;
        const currentP = progress.get();
        const currentX = mobilePanX.get();
        const currentY = mobilePanY.get();

        // Smoothly return to 0
        if (currentP > 0.001) {
            progress.set(currentP * 0.95);
            needsUpdate = true;
        } else {
            progress.set(0);
        }

        if (Math.abs(currentX) > 0.5) {
            mobilePanX.set(currentX * 0.9);
            needsUpdate = true;
        } else {
            mobilePanX.set(0);
        }

        if (Math.abs(currentY) > 0.5) {
            mobilePanY.set(currentY * 0.9);
            needsUpdate = true;
        } else {
            mobilePanY.set(0);
        }

        if (needsUpdate) {
            requestAnimationFrame(animateReset);
        }
    };
    requestAnimationFrame(animateReset);
  }, [progress, mobilePanX, mobilePanY]);

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e) => {
      isInteracting.current = true;
      if (resetTimer.current) clearTimeout(resetTimer.current);
      
      touchStart.current = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY
      };

      // Check if holding in place (Zoom In)
      // Use a recursive check that cancels if moved too much
      const startPos = { ...touchStart.current };
      
      const checkHold = setTimeout(() => {
        if (isInteracting.current) {
             // If still touching and haven't moved much, zoom in
             // This logic is handled in move, if delta is small, we don't zoom out. 
             // But to explicitly zoom in we need a loop.
             const animateZoomIn = () => {
                if (!isInteracting.current) return;
                // Check if still roughly in same spot (simple check done via flag in move)
                const currentP = progress.get();
                if (currentP > 0) {
                    progress.set(Math.max(0, currentP - 0.02));
                    requestAnimationFrame(animateZoomIn);
                }
             };
             animateZoomIn();
        }
      }, 200);
      
      // Store timer to cancel if moved
      touchStart.current.holdTimer = checkHold;
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      
      const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (movement > 5) {
        // If moved > 5px, cancel hold zoom
        if (touchStart.current.holdTimer) clearTimeout(touchStart.current.holdTimer);

        // Zoom Out
        const currentP = progress.get();
        progress.set(Math.min(1, currentP + 0.015)); // Faster response

        // Pan in direction of swipe
        // Swipe Up (Drag Up) -> Camera moves Up (Revealing Bottom)
        // Standard Drag: Content moves with finger.
        // If I drag Up (Finger goes Up, DeltaY < 0), Content should go Up. 
        // Camera Y must go Down (-Y) to make Content go Up? No.
        // Camera +Y moves view "down" the map.
        // If I want to see Top content (-Y), I drag Down (Finger goes Down).
        // Let's stick to "Drag Map" logic. 
        // Finger Down (+Y) -> Map moves Down (+Y) -> Camera moves Up (-Y)? 
        // Correct: Camera = -Translation.
        // To move map DOWN, Camera must move UP (-Y).
        
        const currentPanX = mobilePanX.get();
        const currentPanY = mobilePanY.get();
        const panFactor = 1.5;

        // Inverse delta for "Drag" feel
        mobilePanX.set(currentPanX - deltaX * panFactor); 
        mobilePanY.set(currentPanY - deltaY * panFactor);
        
        // Update start pos
        touchStart.current.x = touch.clientX;
        touchStart.current.y = touch.clientY;
      }
    };

    const handleTouchEnd = () => {
      isInteracting.current = false;
      if (touchStart.current.holdTimer) clearTimeout(touchStart.current.holdTimer);
      
      // Start idle reset timer
      resetTimer.current = setTimeout(() => {
        resetToCenterMobile();
      }, 3000); // 3s idle
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, progress, mobilePanX, mobilePanY, resetToCenterMobile]);

  // --- Calculated Values ---
  const startScale = isMobile ? 0.5 : 1; 
  const scale = useTransform(smoothProgress, [0, 1], [startScale, 0.15]);
  const contentOpacity = useTransform(smoothProgress, [0.05, 0.2], [0, 1]);
  
  // --- Mouse / Torch Logic ---
  const mouseX = useMotionValue(winSize.w / 2);
  const mouseY = useMotionValue(winSize.h / 2);
  const smoothMouseX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const smoothMouseY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isMobile]);
  
  useEffect(() => {
     if (!isMobile) return;
     const handleTouchMove = (e) => {
        if (e.touches[0]) {
           mouseX.set(e.touches[0].clientX);
           mouseY.set(e.touches[0].clientY);
        }
     };
     window.addEventListener('touchmove', handleTouchMove, { passive: false });
     return () => window.removeEventListener('touchmove', handleTouchMove);
  }, [isMobile, mouseX, mouseY]);

  // --- Camera Logic ---
  
  // Desktop: "Zoom in to mouse pointer location"
  // When we scale up (Zoom In), CSS TransformOrigin handles the "towards mouse" effect.
  // We set TransformOrigin to the mouse position.
  // ISSUE FIX: When zooming OUT (Scale < 1), we want to see the whole map (Center).
  // If TransformOrigin is Mouse, zooming out shrinks it towards the mouse, leaving the rest of the screen blank.
  // We want: Zoom In -> Focus on Mouse. Zoom Out -> Focus on Center.
  // Solution: Interpolate TransformOrigin from "Mouse" (at Progress 0) to "Center" (at Progress 1).
  
  const centerOriginX = "50%";
  const centerOriginY = "50%";
  
  // We can't easily interpolate string "50%" to pixel value in Framer Motion templates directly without complex transforms.
  // Instead, we'll compute the pixel value of center.
  
  const originX = useTransform(() => {
     if (isMobile) return "50%";
     const mX = smoothMouseX.get();
     const cX = winSize.w / 2;
     // Interpolate: 0 (ZoomIn) -> mX, 1 (ZoomOut) -> cX
     const p = smoothProgress.get();
     const currentOrigin = mX + (cX - mX) * p; 
     return `${currentOrigin}px`;
  });

  const originY = useTransform(() => {
     if (isMobile) return "50%";
     const mY = smoothMouseY.get();
     const cY = winSize.h / 2;
     const p = smoothProgress.get();
     const currentOrigin = mY + (cY - mY) * p;
     return `${currentOrigin}px`;
  });

  // Desktop Panning Fix: 
  // "On desktop the camera zooms out and pans in the top left direction."
  // This was caused by the previous `desktopCameraX` logic which pushed away from center.
  // With the new `origin` logic, we might not strictly need extra panning, 
  // OR we need to ensure panning is centered.
  // Let's REMOVE the extra `panIntensity` logic for Desktop and rely purely on TransformOrigin 
  // to handle the "Zoom to" effect. If we want to "Look around" while zoomed in, that's different.
  // But the request says "Zoom in to mouse pointer".
  // If we remove `panIntensity`, the camera stays at 0,0. 
  // Zooming out with Origin -> Center means it shrinks to center. Correct.
  // Zooming in with Origin -> Mouse means it expands from mouse. Correct.

  const finalCameraX = useTransform(() => isMobile ? mobilePanX.get() : 0);
  const finalCameraY = useTransform(() => isMobile ? mobilePanY.get() : 0);

  // Compass
  const compassRotation = useTransform(() => {
    const x = finalCameraX.get();
    const y = finalCameraY.get();
    // Default North if 0,0
    if (x === 0 && y === 0) return 0;
    return Math.atan2(y, x) * (180 / Math.PI) + 90;
  });

  return (
    <>
      {/* Virtual Scroll Container (Desktop Only) */}
      {!isMobile && (
        <div style={{ height: '250vh' }} className="relative w-full pointer-events-none z-[-1]" />
      )}

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
        style={{ opacity: useTransform(smoothProgress, [0, 0.1], [1, 0]) }}
      >
        {isMobile ? "Swipe to Explore • Hold to Zoom In" : "Scroll to Explore • Follow the Light"}
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
            transformOrigin: useMotionTemplate`${originX} ${originY}`
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
