import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, ExternalLink } from 'lucide-react';
import { content } from './data/content';

// Assets
import rockTexture from '../assets/rock-texture.jpg';
import noiseGrain from '../assets/noise-grain.png';

// --- Constants ---
const PROXIMITY_THRESHOLD = 300; 

// --- Components ---

const Flashlight = ({ isMobile, isInGallery, flashlightX, flashlightY, flashlightOpacity }) => {
  const baseSize = isMobile ? 250 : 800;
  const expandedSize = isMobile ? 500 : 1600;
  
  const sizeValue = isInGallery ? expandedSize : baseSize;
  const smoothSize = useSpring(sizeValue, { damping: 30, stiffness: 50 });

  // Use useMotionTemplate with variables that are always MotionValues
  const mask = useMotionTemplate`radial-gradient(circle ${smoothSize}px at ${flashlightX} ${flashlightY}, transparent 0%, rgba(0,0,0,0.98) 95%, black 100%)`;

  return (
    <motion.div 
      className="fixed inset-0 z-[100] pointer-events-none bg-black"
      style={{ 
        maskImage: mask,
        WebkitMaskImage: mask,
        opacity: flashlightOpacity
      }}
    >
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay animate-grain"
        style={{ backgroundImage: `url(${noiseGrain})` }}
      />
    </motion.div>
  );
};

const InteractiveElement = ({ children, index, fx, fy, isMobile, parallaxSpeed = 1 }) => {
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const speed = useMemo(() => (index % 4 + 2) * 15 * parallaxSpeed, [index, parallaxSpeed]);
  const yMove = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const smoothY = useSpring(yMove, { stiffness: 50, damping: 20 });

  useEffect(() => {
    let frameId;
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dist = Math.sqrt(Math.pow(fx.get() - centerX, 2) + Math.pow(fy.get() - centerY, 2));
      setIsRevealed(dist < PROXIMITY_THRESHOLD);
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [fx, fy]);

  return (
    <motion.div ref={containerRef} style={{ y: smoothY }} className="w-full">
      {typeof children === 'function' ? children(isRevealed) : children}
    </motion.div>
  );
};

const InteractiveImage = ({ src, alt, title, subtitle, quote, isLeft, index, fx, fy, isMobile }) => {
  return (
    <div className={`relative mb-64 flex w-full ${isLeft ? 'justify-start md:pl-[10%]' : 'justify-end md:pr-[10%]'}`}>
      <InteractiveElement index={index} fx={fx} fy={fy} isMobile={isMobile}>
        {(isRevealed) => (
          <div className="relative max-w-xl group px-6 md:px-0">
            <div className="relative overflow-hidden">
              <img 
                src={src} 
                alt={alt}
                className={`w-full transition-all duration-1000 ease-in-out ${isRevealed ? 'grayscale-0 brightness-100 blur-0' : 'grayscale brightness-50 blur-md'}`}
                style={{
                  maskImage: 'radial-gradient(rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
                  WebkitMaskImage: 'radial-gradient(rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)'
                }}
              />
            </div>
            <div className={`mt-8 space-y-4 max-w-sm transition-opacity duration-700 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="font-serif text-2xl md:text-3xl text-lu-gold tracking-wider uppercase">{title}</h3>
              {subtitle && <p className="font-sans text-[10px] md:text-xs text-white/40 uppercase tracking-[0.4em] font-light">{subtitle}</p>}
              {quote && <p className="text-base md:text-lg text-white/50 font-extralight leading-relaxed italic border-l border-lu-gold/20 pl-6 mt-6">{quote}</p>}
            </div>
          </div>
        )}
      </InteractiveElement>
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState('ru');
  const t = content[lang];
  const [isMobile, setIsMobile] = useState(false);
  const [isInGallery, setIsInGallery] = useState(false);
  
  const galleryRef = useRef(null);
  
  // Flashlight position and opacity
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const flashlightOpacity = useMotionValue(1);
  
  const smoothX = useSpring(rawX, { damping: 30, stiffness: 200 });
  const smoothY = useSpring(rawY, { damping: 30, stiffness: 200 });
  const smoothOpacity = useSpring(flashlightOpacity, { damping: 40, stiffness: 100 });

  // Actual center position for proximity detection
  const fx = useMotionValue(0);
  const fy = useMotionValue(0);

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 5000], [0, isMobile ? -1000 : -600]);

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
  }, []);

  useEffect(() => {
    let dimTimer;
    const wakeUp = () => {
      flashlightOpacity.set(1);
      if (dimTimer) clearTimeout(dimTimer);
      dimTimer = setTimeout(() => flashlightOpacity.set(0.15), 1500);
    };

    const onMove = (e) => {
      if (!isMobile) {
        rawX.set(e.clientX);
        rawY.set(e.clientY);
        fx.set(e.clientX);
        fy.set(e.clientY);
      }
      wakeUp();
    };

    const onScroll = () => {
      if (galleryRef.current) {
        const rect = galleryRef.current.getBoundingClientRect();
        setIsInGallery(rect.top < window.innerHeight && rect.bottom > 0);
      }
      wakeUp();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchstart', wakeUp, { passive: true });
    window.addEventListener('touchmove', wakeUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    wakeUp();
    return () => {
      if (dimTimer) clearTimeout(dimTimer);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', wakeUp);
      window.removeEventListener('touchmove', wakeUp);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isMobile]);

  // Use transformed values for the flashlight template to handle "50%" or "px"
  const flashlightX = useTransform(smoothX, (v) => isMobile ? "50%" : `${v}px`);
  const flashlightY = useTransform(smoothY, (v) => isMobile ? "50%" : `${v}px`);

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden selection:bg-lu-gold selection:text-black">
      <motion.div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none bg-fixed"
        style={{ 
          backgroundImage: `url(${rockTexture})`,
          backgroundRepeat: 'repeat',
          backgroundSize: isMobile ? '300px' : '600px',
          y: bgY,
          willChange: 'transform'
        }}
      />
      
      <button 
        onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
        className="fixed top-8 right-8 z-[110] flex items-center gap-2 text-xs tracking-[0.4em] text-white/40 hover:text-lu-gold transition-colors uppercase font-extralight mix-blend-difference"
      >
        <Globe size={14} />
        {lang}
      </button>

      <Flashlight 
        isMobile={isMobile} 
        isInGallery={isInGallery} 
        flashlightX={flashlightX} 
        flashlightY={flashlightY} 
        flashlightOpacity={smoothOpacity}
      />

      <main className="relative z-10 flex flex-col items-center pt-[20vh] pb-[20vh] w-full">
        <section className="mb-[50vh] text-center px-6 relative w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="w-full max-w-[90vw]"
          >
            <h1 className="font-serif text-2xl sm:text-4xl md:text-[14rem] text-white tracking-[0.1em] md:tracking-[0.3em] mb-4 drop-shadow-2xl uppercase leading-tight">
              LINGUA<br />UNIVERSALIS
            </h1>
            <p className="font-sans text-[6px] md:text-lg text-lu-gold tracking-[0.2em] md:tracking-[1em] uppercase opacity-40 font-extralight">
              {t.hero.subtitle}
            </p>
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-white/5 rounded-full pointer-events-none -z-10 animate-spin-slow" />
        </section>

        <section className="w-full max-w-6xl px-8 mb-[50vh] flex flex-col md:flex-row gap-20 items-start">
          <InteractiveElement index={1} fx={fx} fy={fy} isMobile={isMobile} parallaxSpeed={0.4}>
            <div className="relative flex-1">
              <h2 className="font-serif text-4xl md:text-6xl text-lu-gold uppercase tracking-[0.4em] mb-12">{t.sections.philosophy}</h2>
              <p className="text-xl md:text-5xl font-extralight text-white/80 leading-relaxed">{t.hero.philosophy}</p>
            </div>
          </InteractiveElement>
          <InteractiveElement index={2} fx={fx} fy={fy} isMobile={isMobile} parallaxSpeed={0.7}>
            <div className="flex-1 text-base md:text-xl text-white/40 leading-loose space-y-8 md:space-y-12 max-w-md ml-auto border-r border-lu-gold/10 pr-10 font-extralight">
              <p>The project is a bridge between the prehistoric and the post-modern. Every design element is a piece of a singular, interconnected whole.</p>
              <p>Real connection between cultures is only possible through the universal language of art and our shared human origins.</p>
            </div>
          </InteractiveElement>
        </section>

        <section ref={galleryRef} className="w-full max-w-7xl px-4 mb-[40vh]">
          <h2 className="text-center font-serif text-3xl md:text-4xl text-lu-gold/40 uppercase tracking-[0.5em] mb-48">{t.sections.gallery}</h2>
          <div className="space-y-32">
            {t.gallery.map((item, i) => (
              <InteractiveImage key={i} src={item.img} alt={item.title} title={item.title} subtitle={`${item.location} • ${item.year}`} isLeft={i % 2 === 0} index={i} fx={fx} fy={fy} isMobile={isMobile} />
            ))}
          </div>
        </section>

        <section className="w-full mb-[40vh] flex flex-col items-center px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-lu-gold uppercase tracking-[0.5em] mb-20">{t.sections.movie}</h2>
          <InteractiveElement index={5} fx={fx} fy={fy} isMobile={isMobile} parallaxSpeed={0.5}>
            {(isRevealed) => (
              <div className={`relative w-full max-w-6xl aspect-video transition-all duration-1000 ${isRevealed ? 'grayscale-0 brightness-100 blur-0' : 'grayscale brightness-50 blur-md'}`}>
                <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-noise opacity-10 z-20 pointer-events-none animate-grain" />
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Lingua Universalis Movie" frameBorder="0" allowFullScreen></iframe>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-lu-gold/10 blur-[120px] rounded-full pointer-events-none" />
              </div>
            )}
          </InteractiveElement>
        </section>

        <section className="w-full max-w-5xl px-8 mb-[40vh]">
          <h2 className="text-center font-serif text-4xl md:text-5xl text-lu-gold uppercase tracking-[0.3em] mb-64">{t.sections.team}</h2>
          <div>
            {t.participants.map((member, i) => (
              <InteractiveImage key={member.id} src={member.img} alt={member.name} title={member.name} subtitle={member.role} quote={member.quote} isLeft={i % 2 === 0} index={i + 12} fx={fx} fy={fy} isMobile={isMobile} />
            ))}
          </div>
        </section>

        <section className="w-full max-w-5xl px-8 flex flex-col items-center">
          <h2 className="font-serif text-4xl md:text-5xl text-lu-gold uppercase tracking-[0.5em] mb-24">{t.sections.events}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 w-full">
            {t.events.list.map((event, i) => (
              <InteractiveElement key={i} index={i} fx={fx} fy={fy} isMobile={isMobile} parallaxSpeed={0.2}>
                <div className="space-y-6 border-t border-lu-gold/10 pt-12">
                  <h3 className="font-serif text-xl md:text-2xl text-white font-extralight">{event.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-lu-gold tracking-widest uppercase font-extralight"><MapPin size={14} /> {event.location}</div>
                  <p className="text-sm md:text-base text-white/40 leading-relaxed font-extralight">{event.desc}</p>
                  <a href={event.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-xs text-lu-gold uppercase tracking-[0.3em] border border-lu-gold/30 px-6 py-3 hover:bg-lu-gold hover:text-black transition-all font-extralight">Explore <ExternalLink size={12} /></a>
                </div>
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
