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
  
  // --- Mouse / Torch Logic ---
  // Initialize to center to avoid jump on load
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const smoothMouseX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const smoothMouseY = useSpring(mouseY, { damping: 25, stiffness: 150 });

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
  const stationaryTimer = useRef(null);
  const isInteracting = useRef(false);

  // Reset to center animation loop
  const resetToCenterMobile = useCallback(() => {
    const animateReset = () => {
        if (isInteracting.current) return; 
        
        let needsUpdate = false;
        const currentP = progress.get();
        const currentX = mobilePanX.get();
        const currentY = mobilePanY.get();

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
      if (stationaryTimer.current) clearTimeout(stationaryTimer.current);
      
      touchStart.current = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY
      };
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      
      const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Reset stationary timer on every move
      if (stationaryTimer.current) clearTimeout(stationaryTimer.current);
      
      // If we stop moving for 100ms while touching, trigger zoom in
      stationaryTimer.current = setTimeout(() => {
         const animateZoomIn = () => {
            if (!isInteracting.current) return; // Stop if ended
            // We assume we are "holding" now
            const currentP = progress.get();
            if (currentP > 0) {
                progress.set(Math.max(0, currentP - 0.02));
                requestAnimationFrame(animateZoomIn);
            }
         };
         animateZoomIn();
      }, 150);

      if (movement > 2) {
        // Zoom Out on movement
        const currentP = progress.get();
        progress.set(Math.min(1, currentP + 0.015)); 

        // Pan in direction of swipe
        const currentPanX = mobilePanX.get();
        const currentPanY = mobilePanY.get();
        const panFactor = 1.5;

        mobilePanX.set(currentPanX - deltaX * panFactor); 
        mobilePanY.set(currentPanY - deltaY * panFactor);
        
        touchStart.current.x = touch.clientX;
        touchStart.current.y = touch.clientY;
      }
    };

    const handleTouchEnd = () => {
      isInteracting.current = false;
      if (stationaryTimer.current) clearTimeout(stationaryTimer.current);
      
      resetTimer.current = setTimeout(() => {
        resetToCenterMobile();
      }, 3000); 
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

  // --- Calculated Values ---
  const startScale = isMobile ? 0.75 : 1; 
  const scale = useTransform(smoothProgress, [0, 1], [startScale, 0.15]);
  const contentOpacity = useTransform(smoothProgress, [0.05, 0.2], [0, 1]);

  // --- Camera Logic ---
  
  // FIX: The previous logic relied on updating Translation based on Mouse position.
  // This causes issues because if mouse moves, Translation updates, shifting the whole world.
  // If you scroll (Zoom), the Translation formula changes, also shifting the world.
  // The result was "Reversible" because the state (Progress + Mouse) uniquely determined view.
  // But it didn't feel like "Zooming IN" to a specific point if that point moved.
  
  // BETTER APPROACH: "Sticky" Zoom Target.
  // When Zooming IN (Progress decreasing), we want to "lock on" to the current mouse position as the anchor.
  // When Zooming OUT (Progress increasing), we want to release that anchor and return to Center.
  
  // To achieve "Zoom to Point" without shifting the world when mouse moves at P=0:
  // We need to decouple the "Zoom Target" from the "Current Mouse".
  // BUT: On a website, users expect to "aim" with the mouse in real-time.
  // If I move mouse to top-left, I expect to see top-left.
  
  // The issue "Zoom still feels centered" likely means the translation magnitude isn't enough 
  // to counteract the scaling towards center.
  // The offset `(Center - Mouse)` is correct ONLY if `transformOrigin` is effectively Center.
  // At Scale S, a point P moves to `Center + (P - Center) * S`.
  // We want P (Mouse) to be at Center of Screen.
  // Target Pos = Center.
  // `Center = Center + (Mouse - Center) * S + Translation`.
  // `0 = (Mouse - Center) * S + Translation`.
  // `Translation = -(Mouse - Center) * S = (Center - Mouse) * S`.
  
  // My previous formula was `(Center - Mouse) * (1 - p)`.
  // `(1 - p)` is roughly `S` (Scale) only if Scale is linear [0,1].
  // But Scale is `[1, 0.15]`.
  // At P=0, Scale=1. Formula gives `(Center - Mouse) * 1`. Correct.
  // At P=1, Scale=0.15. Formula gives `(Center - Mouse) * 0` = 0. 
  // This means at Max Zoom Out, Translation is 0 (Centered). Correct.
  
  // However, maybe the linear interpolation `(1-p)` is mismatched with the `scale` spring?
  // `scale` uses `smoothProgress`. `desktopCamera` uses `smoothProgress`. 
  // But `scale` maps [0,1] -> [1, 0.15].
  // If we want precise locking, we should use `scale` value in the formula?
  // `Translation = (Center - Mouse) * (Scale - 0.15) / (1 - 0.15)`? 
  // No, we want Translation to be 0 at Scale 0.15.
  
  // Let's try simpler logic: 
  // We want to look at the Mouse.
  // LookAt(Target) means Translation = Center - Target.
  // Target = Mouse (at P=0) -> Center (at P=1).
  // Target = Mouse * (1-P) + Center * P.
  // Translation = Center - [Mouse * (1-P) + Center * P].
  //             = Center - Mouse*(1-P) - Center*P
  //             = Center*(1-P) - Mouse*(1-P)
  //             = (Center - Mouse) * (1-P).
  // This matches the formula exactly!
  
  // SO WHY does it feel wrong?
  // Maybe `smoothMouse` isn't updating fast enough?
  // Or maybe the "Reversibility" is the annoyance: 
  // "If I scroll up, then move mouse, then scroll down, view is same."
  // Yes, that is stateless physics. 
  // If you want stateful "Pan", you need to accumulate values like on Mobile.
  // BUT doing that on Desktop with Scroll is tricky (Scroll usually implies timeline).
  
  // User suggestion: "Another panning mechanic: elements move, not camera."
  // That is what `x/y` translation on the container does.
  
  // "Zoom in to title": This happens if `(Center - Mouse)` is close to 0.
  // Ensure `winSize` is correct.
  
  // HYPOTHESIS: The `transformOrigin` on the motion div is '50% 50%'.
  // But the content inside is absolutely positioned around 0,0 (Center).
  // The "Center" of the DIV is the Title.
  // So scaling from 50% 50% SCALES FROM THE TITLE.
  // Our translation tries to shift the Title away to bring Mouse to Center.
  // If I hover Top-Left, Translation becomes (+, +). Title moves Down-Right.
  // Top-Left content moves to Center. This IS correct.
  
  // Maybe the `scale` mapping [1, 0.15] is too aggressive or the `1-p` factor fades out too fast?
  // At P=0.5 (Mid Zoom), Scale = 0.575. Translation factor = 0.5.
  // Translation = 0.5 * Offset.
  // Required Translation for "Lock": `(Center - Mouse) * S` = 0.575 * Offset.
  // We provide 0.5 * Offset.
  // 0.5 != 0.575. 
  // THERE IS THE DRIFT!
  
  // CORRECT FORMULA derivation:
  // We want Point M (Mouse World Pos) to appear at Screen Center at Zoom Z.
  // ScreenPos = (WorldPos - CameraPos) * Scale + ScreenCenter.
  // We want ScreenPos = ScreenCenter.
  // 0 = (M - CameraPos) * Scale.
  // CameraPos = M.
  // So Camera Translation (which moves world opposite) should be `-M`.
  // Wait, our Setup is:
  // Div is centered. 0,0 is Center.
  // Transform: translate(x, y) scale(s).
  // ScreenPos = WorldPos * s + x + ScreenCenter.
  // We want ScreenPos of Mouse(M) to be ScreenCenter?
  // No, M is screen coordinates of mouse.
  // WorldPos of point under mouse M is roughly (M - ScreenCenter) / s (if x=0).
  // Let W_m be that world point.
  // We want W_m to stay at ScreenPos M? (Zoom to point).
  // ScreenPos_new = W_m * s_new + x_new + ScreenCenter.
  // We want ScreenPos_new = M.
  // M = [(M - ScreenCenter)/s_old] * s_new + x_new + ScreenCenter.
  // This is standard "Zoom towards point".
  // But we are mapping Scroll -> Scale/Pos. We don't have delta steps.
  
  // Let's go back to the Goal:
  // At Scale 1 (P=0): Point under Mouse (which is M relative to center if no pan) should remain at M.
  // Since we are at Scale 1, x=0, this is tautology.
  
  // Let's look at the Goal "Zoom In to Flashlight".
  // This implies: As we Zoom In (P -> 0), the camera moves towards the Flashlight.
  // So at P=0, Camera is ON Flashlight.
  // If Camera is ON Flashlight, that means Flashlight World Pos is at Center of Screen.
  // Current Mouse Screen Pos M. 
  // World Point W is at M.
  // If we Center W, then M moves to Center.
  // This shifts the view. 
  // Is this what we want? "Zoom in to mouse pointer".
  // Usually means "Expand the area under the mouse". 
  // It does NOT mean "Move mouse point to center". 
  // It means "Keep mouse point fixed on screen".
  // The previous "Shift to Center" logic was interpreting "Zoom to X" as "Center on X".
  // Standard UI Zoom: The pixel under the mouse stays under the mouse.
  // My logic was shifting it to the center!
  // THAT is why it felt wrong/centered!
  
  // FIX:
  // To keep Point W (at M) fixed on screen while scaling:
  // We need `transformOrigin` to be M. 
  // But M changes.
  // We can simulate `transformOrigin` using translation.
  // Translation needed to emulate origin at M:
  // T = (M - Center) * (1 - Scale).
  // Let's verify.
  // Point M relative to Center is `Offset = M - Center`.
  // NewPos = Offset * Scale + T + Center.
  // We want NewPos = M = Offset + Center.
  // Offset * Scale + T = Offset.
  // T = Offset * (1 - Scale).
  // T = (M - Center) * (1 - Scale).
  
  // Current Formula used: `(Center - M) * (1 - P)`.
  // My previous code: `(Center - M)` is `-Offset`.
  // So `T = -Offset * (1 - P)`.
  // If `(1-P) ~ (1-Scale)`, then `T = -Offset * (1 - Scale)`.
  // Derived requirement: `T = Offset * (1 - Scale)`.
  // THEY ARE OPPOSITE SIGNS!
  // I was pushing the mouse point AWAY from the center (centering it?) 
  // instead of pulling the world to keep it fixed?
  // Wait.
  // If I zoom in (Scale 1 -> 2). 1 - Scale = -1.
  // T = Offset * (-1) = -Offset.
  // If Mouse is Right (+100). T = -100. Shift Left.
  // World moves Left. Point under mouse moves Left.
  // But expanding (Scale 2) pushes point Right (200).
  // 200 - 100 = 100. Point stays at 100. CORRECT.
  // So `T = (M - Center) * (1 - Scale)` is correct for "Zoom to Point".
  
  // My code had: `(Center - M) * (1 - p)`.
  // `(Center - M)` is `-Offset`.
  // So `T = -Offset * (1 - p)`.
  // This matches the sign!
  
  // But `1 - p` is NOT `1 - Scale`.
  // Scale = 1 -> 0.15.
  // At P=0: Scale=1. 1-S=0. 1-P=1.
  // T_code = -Offset * 1 = -Offset. (Shifts point to center).
  // T_req = Offset * 0 = 0. (No shift).
  
  // RESULT: My code was forcing the point to move to the Center at Zoom 1!
  // That is "Focus on Mouse", but usually "Zoom to Mouse" means "Keep Mouse Point Fixed".
  // However, at P=1 (Zoom Out), Scale=0.15. 1-S=0.85. 1-P=0.
  // T_code = 0.
  // T_req = Offset * 0.85.
  
  // We need to implement `T = (M - Center) * (1 - Scale)`.
  // Use the actual `scale` MotionValue!
  
  const desktopCameraX = useTransform(() => {
    if (isMobile) return 0;
    const mX = smoothMouseX.get();
    const s = scale.get(); // Use actual scale value!
    const center = winSize.w / 2;
    // Formula: (Mouse - Center) * (1 - Scale)
    return (mX - center) * (1 - s);
  });

  const desktopCameraY = useTransform(() => {
    if (isMobile) return 0;
    const mY = smoothMouseY.get();
    const s = scale.get();
    const center = winSize.h / 2;
    return (mY - center) * (1 - s);
  });
  
  // Mobile: Same logic?
  // "Zoom in to finger" -> Keep finger point fixed.
  // Yes.
  const mobileCameraX = useTransform(() => {
     const mX = smoothMouseX.get(); 
     const s = scale.get();
     const center = winSize.w / 2;
     return mobilePanX.get() + (mX - center) * (1 - s);
  });

  const mobileCameraY = useTransform(() => {
     const mY = smoothMouseY.get();
     const s = scale.get();
     const center = winSize.h / 2;
     return mobilePanY.get() + (mY - center) * (1 - s);
  });

  const finalCameraX = useTransform(() => isMobile ? mobileCameraX.get() : desktopCameraX.get());
  const finalCameraY = useTransform(() => isMobile ? mobileCameraY.get() : desktopCameraY.get());

  // Compass
  const compassRotation = useTransform(() => {
    const x = finalCameraX.get();
    const y = finalCameraY.get();
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
            transformOrigin: '50% 50%'
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
