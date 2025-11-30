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
  
  // We revert the panning logic to the previous one which was working correctly for direction.
  // The formula `(Center - Mouse) * (1 - p)` shifts the content opposite to mouse, revealing the side you look at.
  
  // Why it was zooming to Center?
  // Because `scale` decreases from 1 -> 0.15.
  // And my previous attempt to fix it by using `(1 - s)` introduced weird inversions.
  // The issue is likely that `(1-p)` goes to 0 at Zoom Out, centering everything. This is intended for Zoom Out.
  // But for Zoom In, we want to center the Mouse.
  
  // Let's try simpler logic again:
  // At P=0 (Zoomed In), we want Mouse Point to be at Mouse Point. 
  // Default transform origin 50% 50% keeps Center at Center.
  // If Mouse is Top-Left, we want Top-Left to be Top-Left.
  // Center is Center. Top-Left is Top-Left.
  // So NO TRANSLATION is needed if Scale=1 and Origin=Center? 
  // If I have a map. Center is (0,0).
  // Mouse is (-100, -100).
  // If I scale 1x, Mouse is at (-100, -100). Correct.
  // If I scale 0.5x, Mouse point on map moves to (-50, -50).
  // But my Mouse Cursor is still at (-100, -100).
  // So the point under mouse DRIFTED from -100 to -50.
  // I want the point under mouse to STAY at -100.
  // So I need to translate the world by -50.
  // Translate = MousePos - MousePosScaled.
  // Translate = M - (M * Scale).
  // Translate = M * (1 - Scale).
  
  // M here is relative to Center.
  // M_rel = Mouse - Center.
  // Translate = (Mouse - Center) * (1 - Scale).
  
  // This formula `(Mouse - Center) * (1 - Scale)` moves the point under mouse to keep it under mouse.
  // If Mouse is Top-Left (-100).
  // T = -100 * (1 - 0.5) = -50.
  // World moves Left by 50.
  // Scaled Point was at -50. New Pos = -50 - 50 = -100.
  // Point is back at Mouse.
  
  // This confirms `(Mouse - Center) * (1 - Scale)` IS the correct logic for "Zoom to Point".
  // Why did it invert panning?
  // `(Mouse - Center)`: If Mouse is Right (> Center), Value is Positive.
  // Translation is Positive. World moves Right.
  // If World moves Right, we see MORE OF LEFT.
  // Panning Right -> Seeing Left.
  // This is "Inverted" or "Dragging" panning.
  
  // User says: "Panning is inverted... Title moves under cursor every time."
  // "User moves mouse to some section and this section moved closer to center."
  // If I move Mouse Right (to look at Right Section).
  // I want Right Section to move Left (towards Center).
  // So World must move Left.
  // Translation must be Negative.
  // `(Mouse - Center)` is Positive.
  // So we need NEGATIVE of this formula?
  // `-(Mouse - Center) * Factor` = `(Center - Mouse) * Factor`.
  
  // Let's check `(Center - Mouse) * (1 - Scale)`.
  // Mouse Right (+). Offset Negative. T Negative. World Left. Section moves to Center.
  // This matches "Look At" / "Camera Pan" logic.
  // Does it break "Zoom to Point"?
  // Scale 0.5. T = -50.
  // Scaled Point at -50. T adds -50. Result -100.
  // Point -100 is at -100. 
  // WAIT. 
  // If I move Mouse RIGHT (+100).
  // Scaled Point moves to +50.
  // I want it to stay at +100?
  // If I use `(Center - Mouse)`, T = (-100) * 0.5 = -50.
  // New Pos = +50 - 50 = 0.
  // The Point under Mouse moves to CENTER (0).
  // THIS IS "ZOOM TO CENTER" (or rather "Bring Mouse to Center").
  
  // The User wants:
  // 1. "Move mouse to some section and this section moved closer to center." -> `(Center - Mouse)` logic.
  // 2. "Zoom in to mouse pointer" -> usually means "Keep fixed".
  // But if we "Bring Mouse to Center", we are effectively Zooming to it?
  // Actually, if I point at something and it moves to center, I am focusing on it.
  // But if I move my mouse, it keeps chasing my mouse to the center.
  // This creates the "Title moves under cursor" feeling if I move mouse back to center?
  // No, if I move mouse to center, Offset is 0. Title is at Center.
  
  // The Conflict:
  // "Zoom to Point" (Keep Fixed) vs "Look At Mouse" (Bring to Center).
  // User liked the OLD panning behavior ("Section moved closer to center").
  // But complained "Zoom feels centered".
  // Maybe they want "Look At Mouse" but LESS intense?
  // Or maybe they want "Look At Mouse" only when Zoomed In?
  
  // Let's assume "Zoom to Point" (Fixed) is the standard correct behavior.
  // Formula: `(Mouse - Center) * (1 - Scale)`.
  // This means:
  // Mouse Right (+100). T = +50. World moves Right.
  // We see MORE OF LEFT? No.
  // If World moves Right, content moves Right.
  // Content on Right moves further Right (Away from Center).
  // Content on Left comes into view? No, Left is pushed further Left.
  // If I move Mouse Right, I expect to see Right.
  // To see Right, World must move Left.
  // So "Zoom to Point" physics (World Right) is OPPOSITE to "Look At" physics (World Left).
  
  // How to reconcile?
  // "Zoom to Point" is critical for scaling.
  // "Look At" is critical for panning.
  
  // Maybe we apply "Look At" logic ONLY when zoomed out?
  // And "Zoom to Point" when zoomed in?
  // Or we calculate Pan separately from Zoom compensation.
  
  // Let's try simpler approach used in game maps:
  // Camera Target = Mouse.
  // We shift Camera Target based on Zoom level.
  
  // Revert to `(Center - Mouse) * (1 - p)`.
  // This was the "Look At" logic.
  // User said "Zoom stayed same, center zoom".
  // This is because at P=1 (Zoom Out), T=0 (Center).
  // At P=0 (Zoom In), T = (Center - Mouse).
  // This shifts Mouse Point to Center.
  // This IS "Zoom to Mouse" in terms of focusing.
  
  // Why did user say "Zoom feels centered"?
  // Maybe because they want to ZOOM OUT from the Mouse?
  // If I am at P=0 (Focused on Mouse, Mouse is Centered).
  // I Scroll Down (Zoom Out). P -> 1.
  // T goes to 0.
  // The view drifts back to Title Center.
  // The point I was looking at slides away from Center back to its original spot.
  // This feels like "Zooming Out to Center".
  
  // If I want to "Zoom Out from Mouse":
  // The point should stay Centered?
  // No, if I stay Mouse, it should stay Centered?
  // If I scroll down, I want the map to shrink, but my point of interest to stay visible?
  
  // Let's restore the `(Center - Mouse) * (1 - p)` logic (inverted direction from current build).
  // And verify scale/progress mapping.
  // Scale [1 -> 0.15].
  // P [0 -> 1].
  
  // Current build has `(Mouse - Center) * (1 - s)`.
  // This is "Fixed Point".
  // User says "Panning is inverted".
  // So they definitely want `(Center - Mouse)`.
  // Let's switch back to `(Center - Mouse)` sign.
  // Now, deciding the factor.
  // `(1 - p)` vs `(1 - s)`.
  // `(1-p)` is Linear. `(1-s)` is based on Scale.
  // If we use `(Center - Mouse) * (1 - s)`:
  // At P=0, S=1. T=0.
  // Mouse Point is at Mouse Pos (Not Centered).
  // At P=1, S=0.15. T = Offset * 0.85.
  // Mouse Right (+100). T = -85. World Left.
  // We see Right.
  // This matches "Look At" panning!
  // AND at Zoom In (S=1), T=0. No shift.
  // So Zoom In puts you at standard view.
  // Zoom Out (S < 1) pulls camera towards Mouse to reveal that side.
  
  // Let's try `(Center - Mouse) * (1 - s)`.
  // This seems to satisfy "Panning moves section to center".
  // And satisfies "Zoom Out reveals side".
  // And satisfies "Zoom In to Mouse" (because as S->1, T->0, we return to Mouse Pos).
  
  // Wait, if I am at S=0.15 (Zoom Out). T = Large. Looking at Right.
  // I Zoom In (S->1). T -> 0.
  // World slides Right (back to center).
  // Right section (which was centered) moves Right (back to original pos).
  // Mouse is at Right.
  // So effectively, the Section under mouse moves FROM Center TO Mouse Pos.
  // This is "Zooming In".
  // Does it feel centered?
  // At S=1, View is Centered on Title?
  // Yes, T=0 means (0,0) is at Center.
  // So Zoom In ALWAYS takes you to Title?
  // YES. THIS IS THE PROBLEM.
  // At P=0, we enforce T=0.
  // So we enforce looking at Title.
  // We want to Look At Mouse at P=0?
  // Then T must be `Center - Mouse` at P=0?
  // If T = `(Center - Mouse) * 1`.
  // Then at P=0, we look at Mouse.
  // At P=1, we want to Look at Center? T=0?
  // Then factor should be `(1 - p)`?
  // T = `(Center - Mouse) * (1 - p)`.
  // At P=0, T = Offset. Look At Mouse.
  // At P=1, T = 0. Look At Center.
  // This was the OLD logic (first iteration).
  // User said "Zoom feels centered".
  
  // Maybe `(1-p)` drops too fast?
  // Or maybe we need `(Center - Mouse)` to persist?
  // If I Zoom In, I want to stay Looking At Mouse.
  // If I Zoom Out, I want to see Everything (Center).
  // So T should go Offset -> 0.
  
  // Let's use `(Center - Mouse)` but simpler dampening.
  // And ensure `desktopCameraX/Y` uses `smoothMouse` AND `scale`.
  
  // Reverting to `(Center - Mouse)` direction to fix Panning.
  // Using a blend that favors LookAt.
  
  const desktopCameraX = useTransform(() => {
    if (isMobile) return 0;
    const mX = smoothMouseX.get();
    const p = smoothProgress.get();
    const center = winSize.w / 2;
    
    // "Pin Point" Zoom with "Look At" Panning
    // Formula: T = (Center - Mouse) * (Scale * (1 + k) - 1)
    // k = Panning Sensitivity.
    // Logic: 
    // 1. Pinning: To keep a point fixed, T must satisfy T_pin = (Mouse - Center) * (1 - Scale).
    // 2. Panning: To see edges, we add T_pan = (Center - Mouse) * k * Scale.
    // Combined gives the formula above.
    
    const k = 6; 
    const s = 1 - p * 0.85; // Desktop Scale (1 -> 0.15)
    
    // Check for inversion: s * (1 + k) must be > 1 to maintain direction.
    // At s=0.15: 0.15 * 7 = 1.05 > 1. OK.
    
    const factor = s * (1 + k) - 1;
    return (center - mX) * factor;
  });

  const desktopCameraY = useTransform(() => {
    if (isMobile) return 0;
    const mY = smoothMouseY.get();
    const p = smoothProgress.get();
    const center = winSize.h / 2;
    
    const k = 6;
    const s = 1 - p * 0.85;
    const factor = s * (1 + k) - 1;
    
    return (center - mY) * factor;
  });
  
  // Mobile: Also revert to `(Center - Touch)` logic for Zoom-To-Finger.
  // `mobilePanX` handles drag.
  // The offset should help center the finger when zooming in.
  const mobileCameraX = useTransform(() => {
     const mX = smoothMouseX.get(); 
     const p = smoothProgress.get();
     const center = winSize.w / 2;
     return mobilePanX.get() + (center - mX) * (1 - p);
  });

  const mobileCameraY = useTransform(() => {
     const mY = smoothMouseY.get();
     const p = smoothProgress.get();
     const center = winSize.h / 2;
     return mobilePanY.get() + (center - mY) * (1 - p);
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
