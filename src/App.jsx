import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Globe, MapPin, ExternalLink } from 'lucide-react';
import { content } from './data/content';

// Assets
import rockTexture from '../assets/rock-texture.jpg';
import noiseGrain from '../assets/noise-grain.png';

// --- Constants ---
const DEFAULT_PROXIMITY = 350;
const INACTIVITY_TIMEOUT = 1500;
const HOVER_DELAY = 1000; // 1 second delay before expanding
const EDGE_THRESHOLD = 0.15; // 15% from edge triggers shrink

// --- Components ---

const Flashlight = ({ isMobile, flashlightX, flashlightY, isInactive }) => {
  const baseSize = isMobile ? 300 : 800;
  
  // Use motion value + spring for reactive updates
  const sizeTarget = useMotionValue(baseSize);
  const smoothSize = useSpring(sizeTarget, { 
    damping: 20, 
    stiffness: 30,
    mass: 1.5
  });

  // Update target when isInactive changes
  useEffect(() => {
    sizeTarget.set(isInactive ? 0 : baseSize);
  }, [isInactive, baseSize, sizeTarget]);

  const mask = useMotionTemplate`radial-gradient(circle ${smoothSize}px at ${flashlightX} ${flashlightY}, transparent 0%, rgba(0,0,0,0.98) 95%, black 100%)`;

  return (
    <motion.div 
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ 
        backgroundColor: 'black',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay animate-grain"
        style={{ backgroundImage: `url(${noiseGrain})` }}
      />
    </motion.div>
  );
};

// Optimized distance check with throttling
const useThrottledDistanceCheck = (containerRef, fx, fy, isHovered, isMobile) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const lastCheckRef = useRef(0);
  
  useEffect(() => {
    if (isMobile) {
      setIsRevealed(true);
      return;
    }
    
    let frameId;
    const THROTTLE_MS = 32; // ~30fps for distance checks
    
    const update = () => {
      const now = performance.now();
      if (now - lastCheckRef.current < THROTTLE_MS) {
        frameId = requestAnimationFrame(update);
        return;
      }
      lastCheckRef.current = now;
      
      if (!containerRef.current) {
        frameId = requestAnimationFrame(update);
        return;
      }
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Use larger threshold if hovered to keep it revealed
      const threshold = isHovered ? DEFAULT_PROXIMITY * 3 : DEFAULT_PROXIMITY;
      
      const dx = fx.get() - centerX;
      const dy = fy.get() - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      setIsRevealed(dist < threshold);
      frameId = requestAnimationFrame(update);
    };
    
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [containerRef, fx, fy, isHovered, isMobile]);
  
  return isRevealed;
};

const InteractiveElement = ({ children, index, fx, fy, isMobile, parallaxSpeed = 1, isTeam = false }) => {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const speedValue = useMemo(() => (index % 4 + 2) * 15 * parallaxSpeed, [index, parallaxSpeed]);
  const yMove = useTransform(scrollYProgress, [0, 1], [speedValue, -speedValue]);
  const smoothY = useSpring(yMove, { stiffness: 50, damping: 20 });
  
  const isRevealed = useThrottledDistanceCheck(containerRef, fx, fy, isHovered, isMobile);

  return (
    <motion.div 
      ref={containerRef} 
      style={{ y: smoothY, willChange: 'transform' }} 
      className="relative w-full h-full flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {typeof children === 'function' ? children(isRevealed, isHovered) : children}
    </motion.div>
  );
};

const InteractiveImage = ({ src, alt, title, subtitle, quote, index, fx, fy, isMobile, isTeam = false, isInactive = false }) => {
  const containerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false); // Raw hover state
  const [isExpanded, setIsExpanded] = useState(false); // Actual expanded state (after delay)
  const [isInViewport, setIsInViewport] = useState(true);
  
  // Motion values for subtle parallax effect when hovered
  const moveX = useMotionValue(0);
  const moveY = useMotionValue(0);
  
  // Smooth the movement
  const smoothMoveX = useSpring(moveX, { damping: 30, stiffness: 150 });
  const smoothMoveY = useSpring(moveY, { damping: 30, stiffness: 150 });
  
  // Scale spring for smooth GPU-accelerated animation
  const scaleValue = useMotionValue(1);
  const smoothScale = useSpring(scaleValue, { 
    damping: 35, 
    stiffness: 120,
    mass: 0.8
  });

  // Collapse when inactive (flashlight dims)
  useEffect(() => {
    if (isInactive && isExpanded) {
      setIsExpanded(false);
    }
  }, [isInactive, isExpanded]);
  
  // Handle delayed expansion
  useEffect(() => {
    if (isHovering && !isInactive) {
      if (isTeam) {
        // Instant expansion for team members
        setIsExpanded(true);
      } else {
        // Start timer to expand after delay for gallery images
        hoverTimerRef.current = setTimeout(() => {
          setIsExpanded(true);
        }, HOVER_DELAY);
      }
    } else {
      // Clear timer if hover ends before delay
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    }
    
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isHovering, isInactive, isTeam]);

  // Mobile: Collapse on scroll (when image leaves viewport)
  useEffect(() => {
    if (!isMobile || !isExpanded) return;
    
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Check if image center is still in viewport
      const centerY = rect.top + rect.height / 2;
      const inView = centerY > 0 && centerY < viewportHeight;
      
      setIsInViewport(inView);
      
      if (!inView && isExpanded) {
        setIsExpanded(false);
        setIsHovering(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, isExpanded]);
  
  // Update scale based on expanded state with viewport safety
  useEffect(() => {
    if (!isExpanded) {
      scaleValue.set(1);
      moveX.set(0);
      moveY.set(0);
      return;
    }

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Calculate maximum safe scale to fit screen
    const maxScaleW = (winW * 0.9) / rect.width;
    const maxScaleH = (winH * 0.9) / rect.height;
    
    // Default targets
    const defaultScale = isTeam ? 1.2 : 2.5;
    
    // Choose the smallest of all constraints
    const targetScale = Math.min(maxScaleW, maxScaleH, defaultScale);
    
    scaleValue.set(targetScale);
  }, [isExpanded, isTeam, scaleValue, moveX, moveY]);
  
  // Desktop: Track mouse position to detect edge proximity for shrinking
  useEffect(() => {
    if (isMobile || !isExpanded) return;
    
    const handleGlobalMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const currentScale = smoothScale.get();
      
      // Calculate expanded bounds
      const expandedWidth = containerRect.width * currentScale;
      const expandedHeight = containerRect.height * currentScale;
      const centerX = containerRect.left + containerRect.width / 2;
      const centerY = containerRect.top + containerRect.height / 2;
      
      const expandedLeft = centerX - expandedWidth / 2;
      const expandedRight = centerX + expandedWidth / 2;
      const expandedTop = centerY - expandedHeight / 2;
      const expandedBottom = centerY + expandedHeight / 2;
      
      // Check if mouse is inside the expanded image
      const isInsideImage = 
        e.clientX >= expandedLeft &&
        e.clientX <= expandedRight &&
        e.clientY >= expandedTop &&
        e.clientY <= expandedBottom;
      
      if (!isInsideImage) {
        // Mouse is outside - collapse immediately
        setIsExpanded(false);
        setIsHovering(false);
        return;
      }
      
      // Check if mouse is near edges (inside the image but close to border)
      const edgeThresholdX = expandedWidth * EDGE_THRESHOLD;
      const edgeThresholdY = expandedHeight * EDGE_THRESHOLD;
      
      const nearLeftEdge = e.clientX < expandedLeft + edgeThresholdX;
      const nearRightEdge = e.clientX > expandedRight - edgeThresholdX;
      const nearTopEdge = e.clientY < expandedTop + edgeThresholdY;
      const nearBottomEdge = e.clientY > expandedBottom - edgeThresholdY;
      
      const nearEdge = nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge;
      
      if (nearEdge) {
        // Mouse is near edge - collapse
        setIsExpanded(false);
        setIsHovering(false);
      } else {
        // Update subtle motion when in center area
        const relativeX = e.clientX - centerX;
        const relativeY = e.clientY - centerY;
        moveX.set(relativeX * 0.04);
        moveY.set(relativeY * 0.04);
      }
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [isExpanded, isMobile, smoothScale, moveX, moveY]);
  
  // Reset motion when collapsed
  useEffect(() => {
    if (!isExpanded) {
      moveX.set(0);
      moveY.set(0);
    }
  }, [isExpanded, moveX, moveY]);
  
  const handleMouseEnter = useCallback(() => {
    if (!isInactive) {
      setIsHovering(true);
    }
  }, [isInactive]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // For non-expanded state, this will cancel the timer
    // For expanded state, the global mouse tracker handles collapse
  }, []);
  
  const handleTouchStart = useCallback(() => {
    if (isMobile && !isInactive) {
      if (isExpanded) {
        // If already expanded, collapse
        setIsExpanded(false);
        setIsHovering(false);
      } else {
        // Start expansion timer
        setIsHovering(true);
      }
    }
  }, [isMobile, isExpanded, isInactive]);

  // Edge blur mask using multiple linear gradients combined
  const edgeMask = `
    linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%),
    linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)
  `;

  return (
    <InteractiveElement index={index} fx={fx} fy={fy} isMobile={isMobile} isTeam={isTeam}>
      {(isRevealed) => (
        <div 
          ref={containerRef}
          className={`relative group px-6 md:px-0 flex flex-col items-center text-center ${isTeam ? 'max-w-[280px]' : 'max-w-xl'}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
        >
          <div className="relative overflow-visible flex items-center justify-center">
            <motion.img 
              src={src} 
              alt={alt}
              className={`w-full cursor-zoom-in transition-[filter] duration-700 ease-out ${isRevealed ? 'grayscale-0 brightness-100 blur-0' : 'grayscale brightness-50 blur-md'}`}
              style={{
                scale: smoothScale,
                x: smoothMoveX,
                y: smoothMoveY,
                zIndex: isExpanded ? 50 : 10,
                willChange: 'transform',
                transformOrigin: 'center center',
                maskImage: edgeMask,
                WebkitMaskImage: edgeMask,
                maskComposite: 'intersect',
                WebkitMaskComposite: 'source-in',
              }}
              draggable={false}
            />
          </div>
          <div className={`mt-8 space-y-4 w-full transition-opacity duration-700 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className={`font-serif text-lu-gold tracking-wider uppercase ${isTeam ? 'text-xl' : 'text-2xl md:text-3xl'}`}>{title}</h3>
            {subtitle && <p className="font-sans text-[10px] md:text-xs text-white/40 uppercase tracking-[0.4em] font-light">{subtitle}</p>}
            {quote && <p className="text-base md:text-lg text-white/50 font-extralight leading-relaxed italic border-l border-lu-gold/20 pl-6 mt-6 max-w-xs">{quote}</p>}
          </div>
        </div>
      )}
    </InteractiveElement>
  );
};

// Efficient CSS-based rock texture pattern with optimized tiling
const RockBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
      {/* Real tiled rock texture - higher opacity for visibility */}
      <div 
        className="absolute inset-0 opacity-[0.25]"
        style={{ 
          backgroundImage: `url(${rockTexture})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
          mixBlendMode: 'soft-light',
          filter: 'brightness(1.2) contrast(1.1)'
        }}
      />
      
      {/* Base dark gradient depth */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(90, 60, 45, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(75, 50, 40, 0.3) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.9) 100%)
          `
        }}
      />
      
      {/* Noise grain overlay */}
      <div 
        className="absolute inset-0 animate-grain opacity-30"
        style={{ 
          backgroundImage: `url(${noiseGrain})`,
          backgroundSize: '180px',
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState('ru');
  const t = content[lang];
  const [isMobile, setIsMobile] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const inactivityTimerRef = useRef(null);
  
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  
  const smoothX = useSpring(rawX, { damping: 30, stiffness: 200 });
  const smoothY = useSpring(rawY, { damping: 30, stiffness: 200 });

  const fx = useMotionValue(0);
  const fy = useMotionValue(0);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        rawX.set(window.innerWidth / 2);
        rawY.set(window.innerHeight / 2);
        fx.set(window.innerWidth / 2);
        fy.set(window.innerHeight / 2);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [rawX, rawY, fx, fy]);

  // Inactivity detection with proper cleanup
  const wakeUp = useCallback(() => {
    setIsInactive(false);
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = setTimeout(() => {
      setIsInactive(true);
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!isMobile) {
        rawX.set(e.clientX);
        rawY.set(e.clientY);
        fx.set(e.clientX);
        fy.set(e.clientY);
      }
      wakeUp();
    };

    const onScroll = () => wakeUp();

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchstart', wakeUp, { passive: true });
    window.addEventListener('touchmove', wakeUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    wakeUp();
    
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', wakeUp);
      window.removeEventListener('touchmove', wakeUp);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isMobile, rawX, rawY, fx, fy, wakeUp]);

  const flashlightX = useTransform(smoothX, (v) => isMobile ? "50%" : `${v}px`);
  const flashlightY = useTransform(smoothY, (v) => isMobile ? "50%" : `${v}px`);

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden selection:bg-lu-gold selection:text-black">
      {/* Efficient background with tiled rock texture */}
      <RockBackground />
      
      <button 
        onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
        className="fixed top-8 right-8 z-[110] flex items-center gap-2 text-xs tracking-[0.4em] text-white/40 hover:text-lu-gold transition-colors uppercase font-extralight mix-blend-difference"
      >
        <Globe size={14} />
        {lang}
      </button>

      <Flashlight 
        isMobile={isMobile} 
        flashlightX={flashlightX} 
        flashlightY={flashlightY} 
        isInactive={isInactive}
      />

      <main className="relative z-10 flex flex-col items-center pt-[35vh] pb-[20vh] w-full">
        <section className="mb-[50vh] text-center px-4 relative w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="w-full"
          >
            <h1 className="font-serif text-[7vw] sm:text-[6vw] md:text-[8vw] lg:text-[9vw] text-white tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] mb-4 drop-shadow-2xl uppercase leading-[0.9]">
              LINGUA<br />UNIVERSALIS
            </h1>
            <p className="font-sans text-[10px] md:text-lg text-lu-gold tracking-[0.3em] md:tracking-[0.5em] uppercase opacity-40 font-extralight mt-4">
              {t.hero.subtitle}
            </p>
          </motion.div>
        </section>

        <section className="w-full max-w-6xl px-8 mb-[50vh] flex flex-col md:flex-row gap-20 items-start">
          <InteractiveElement index={1} fx={fx} fy={fy} isMobile={isMobile} parallaxSpeed={0.4}>
            {(isRevealed) => (
              <div className={`relative flex-1 transition-opacity duration-1000 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="font-serif text-4xl md:text-6xl text-lu-gold uppercase tracking-[0.4em] mb-12">{t.sections.philosophy}</h2>
                <p className="text-xl md:text-5xl font-extralight text-white/80 leading-relaxed">{t.hero.philosophy}</p>
              </div>
            )}
          </InteractiveElement>
          <InteractiveElement index={2} fx={fx} fy={fy} isMobile={isMobile} parallaxSpeed={0.7}>
            {(isRevealed) => (
              <div className={`flex-1 text-base md:text-xl text-white/40 leading-loose space-y-8 md:space-y-12 max-w-md ml-auto border-r border-lu-gold/10 pr-10 font-extralight transition-opacity duration-1000 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                <p>The project is a bridge between the prehistoric and the post-modern. Every design element is a piece of a singular, interconnected whole.</p>
                <p>Real connection between cultures is only possible through the universal language of art and our shared human origins.</p>
              </div>
            )}
          </InteractiveElement>
        </section>

        {/* Ancient Gallery */}
        <section className="w-full max-w-7xl px-4 mb-[40vh]">
          <h2 className="text-center font-serif text-3xl md:text-4xl text-lu-gold/40 uppercase tracking-[0.5em] mb-48">{t.sections.ancientGallery}</h2>
          <div className="space-y-64 flex flex-col items-center">
            {t.ancientGallery.map((item, i) => (
              <div key={`ancient-${i}`} className={`w-full flex ${i % 2 === 0 ? 'justify-start md:pl-[10%]' : 'justify-end md:pr-[10%]'}`}>
                <InteractiveImage src={item.img} alt={item.title} title={item.title} subtitle={`${item.location} • ${item.year}`} index={i} fx={fx} fy={fy} isMobile={isMobile} isInactive={isInactive} />
              </div>
            ))}
          </div>
        </section>

        {/* Digital Gallery */}
        <section className="w-full max-w-7xl px-4 mb-[40vh]">
          <h2 className="text-center font-serif text-3xl md:text-4xl text-lu-gold/40 uppercase tracking-[0.5em] mb-48">{t.sections.digitalGallery}</h2>
          <div className="space-y-64 flex flex-col items-center">
            {t.digitalGallery.map((item, i) => (
              <div key={`digital-${i}`} className={`w-full flex ${i % 2 !== 0 ? 'justify-start md:pl-[10%]' : 'justify-end md:pr-[10%]'}`}>
                <InteractiveImage src={item.img} alt={item.title} title={item.title} subtitle={`${item.location} • ${item.year}`} index={i + 10} fx={fx} fy={fy} isMobile={isMobile} isInactive={isInactive} />
              </div>
            ))}
          </div>
        </section>

        {/* Movie Section Centered */}
        <section className="w-full mb-[40vh] flex flex-col items-center px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-lu-gold uppercase tracking-[0.5em] mb-20">{t.sections.movie}</h2>
          <div className="w-full max-w-6xl flex justify-center">
            <InteractiveElement index={5} fx={fx} fy={fy} isMobile={isMobile} parallaxSpeed={0.5}>
              {(isRevealed) => (
                <div className={`relative w-full aspect-video transition-all duration-1000 ${isRevealed ? 'grayscale-0 brightness-100 blur-0' : 'grayscale brightness-50 blur-md'}`}>
                  <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-noise opacity-10 z-20 pointer-events-none animate-grain" />
                  <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Lingua Universalis Movie" frameBorder="0" allowFullScreen></iframe>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-lu-gold/10 blur-[120px] rounded-full pointer-events-none" />
                </div>
              )}
            </InteractiveElement>
          </div>
        </section>

        {/* Team Section Chaotic Grid */}
        <section className="w-full max-w-6xl px-8 mb-[40vh]">
          <h2 className="text-center font-serif text-4xl md:text-5xl text-lu-gold uppercase tracking-[0.3em] mb-48">{t.sections.team}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-32 gap-x-12 place-items-center">
            {t.participants.map((member, i) => (
              <div key={member.id} className={`${i % 2 === 0 ? 'md:mt-24' : 'md:-mt-12'} ${i % 3 === 0 ? 'lg:translate-x-10' : 'lg:-translate-x-10'}`}>
                <InteractiveImage 
                  src={member.img} 
                  alt={member.name} 
                  title={member.name} 
                  subtitle={member.role} 
                  quote={member.quote} 
                  index={i + 20} 
                  fx={fx} 
                  fy={fy} 
                  isMobile={isMobile} 
                  isTeam={true}
                  isInactive={isInactive}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Events & Contact */}
        <section className="w-full max-w-5xl px-8 flex flex-col items-center">
          <h2 className="font-serif text-4xl md:text-5xl text-lu-gold uppercase tracking-[0.5em] mb-24">{t.sections.events}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 w-full">
            {t.events.list.map((event, i) => (
              <InteractiveElement key={i} index={i} fx={fx} fy={fy} isMobile={isMobile} parallaxSpeed={0.2}>
                {(isRevealed) => (
                  <div className={`space-y-6 border-t border-lu-gold/10 pt-12 transition-opacity duration-1000 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                    <h3 className="font-serif text-xl md:text-2xl text-white font-extralight">{event.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-lu-gold tracking-widest uppercase font-extralight"><MapPin size={14} /> {event.location}</div>
                    <p className="text-sm md:text-base text-white/40 leading-relaxed font-extralight">{event.desc}</p>
                    <a href={event.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-xs text-lu-gold uppercase tracking-[0.3em] border border-lu-gold/30 px-6 py-3 hover:bg-lu-gold hover:text-black transition-all font-extralight">Explore <ExternalLink size={12} /></a>
                  </div>
                )}
              </InteractiveElement>
            ))}
          </div>
          <div className="mt-[40vh] text-center space-y-12">
            <div className="h-32 w-[1px] bg-gradient-to-b from-transparent to-lu-gold/50 mx-auto" />
            <p className="text-xs tracking-[0.8em] text-white/20 uppercase font-extralight">{t.footer.contacts}</p>
            <h4 className="font-serif text-lu-gold text-xl md:text-2xl tracking-widest font-extralight">{t.footer.text}</h4>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
