import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, ExternalLink } from 'lucide-react';
import { content } from './data/content';

// Assets
import rockTexture from '../assets/rock-texture.jpg';
import noiseGrain from '../assets/noise-grain.png';

// --- Constants ---
const PROXIMITY_THRESHOLD = 350; 

// --- Components ---

const Flashlight = ({ isMobile, isInGallery, globalMouseX, globalMouseY, flashlightOpacity }) => {
  const baseSize = isMobile ? 300 : 800;
  const expandedSize = isMobile ? 600 : 1600;
  
  const size = isInGallery ? expandedSize : baseSize;
  const smoothSize = useSpring(size, { damping: 30, stiffness: 50 });

  // Explicitly center for mobile, ignore globalMouseX/Y
  const x = isMobile ? '50%' : useMotionTemplate`${globalMouseX}px`;
  const y = isMobile ? '50%' : useMotionTemplate`${globalMouseY}px`;
  const radius = useMotionTemplate`${smoothSize}px`;

  const maskImage = useMotionTemplate`radial-gradient(circle ${radius} at ${x} ${y}, transparent 0%, rgba(0,0,0,0.98) 95%, black 100%)`;

  return (
    <motion.div 
      className="fixed inset-0 z-[100] pointer-events-none bg-black"
      style={{ 
        maskImage,
        WebkitMaskImage: maskImage,
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

const InteractiveElement = ({ children, index, globalMouseX, globalMouseY, isMobile, parallaxSpeed = 1 }) => {
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Varied parallax speeds
  const speed = useMemo(() => (index % 3 + 1) * 30 * parallaxSpeed, [index, parallaxSpeed]);
  const yMove = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const smoothY = useSpring(yMove, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const updateProximity = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const fx = isMobile ? window.innerWidth / 2 : globalMouseX.get();
      const fy = isMobile ? window.innerHeight / 2 : globalMouseY.get();
      
      const dist = Math.sqrt(Math.pow(fx - centerX, 2) + Math.pow(fy - centerY, 2));
      setIsRevealed(dist < PROXIMITY_THRESHOLD);
      
      requestAnimationFrame(updateProximity);
    };
    
    const animId = requestAnimationFrame(updateProximity);
    return () => cancelAnimationFrame(animId);
  }, [globalMouseX, globalMouseY, isMobile]);

  return (
    <motion.div 
      ref={containerRef}
      style={{ y: smoothY }}
      className="w-full h-full"
    >
      {typeof children === 'function' ? children(isRevealed) : React.cloneElement(children, { isRevealed })}
    </motion.div>
  );
};

const InteractiveImage = ({ src, alt, title, subtitle, quote, isLeft, index, globalMouseX, globalMouseY, isMobile }) => {
  return (
    <div className={`relative mb-64 flex w-full ${isLeft ? 'justify-start md:pl-[15%]' : 'justify-end md:pr-[15%]'}`}>
      <InteractiveElement index={index} globalMouseX={globalMouseX} globalMouseY={globalMouseY} isMobile={isMobile}>
        {(isRevealed) => (
          <div className="relative max-w-xl group">
            <div className="relative overflow-hidden">
              <img 
                src={src} 
                alt={alt}
                className={`w-full transition-all duration-1000 ease-in-out ${isRevealed ? 'grayscale-0 brightness-100' : 'grayscale brightness-50'}`}
                style={{
                  maskImage: 'radial-gradient(rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
                  WebkitMaskImage: 'radial-gradient(rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)'
                }}
              />
            </div>
            
            <div className={`mt-8 space-y-4 max-w-sm transition-opacity duration-700 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="font-serif text-3xl text-lu-gold tracking-wider uppercase">
                {title}
              </h3>
              {subtitle && (
                <p className="font-sans text-xs text-white/40 uppercase tracking-[0.4em] font-light">
                  {subtitle}
                </p>
              )}
              {quote && (
                <p className="text-lg text-white/50 font-extralight leading-relaxed italic border-l border-lu-gold/20 pl-6 mt-6">
                  {quote}
                </p>
              )}
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
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const flashlightOpacity = useMotionValue(1);
  
  const smoothMouseX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothMouseY = useSpring(mouseY, { damping: 30, stiffness: 200 });
  const smoothFlashlightOpacity = useSpring(flashlightOpacity, { damping: 40, stiffness: 100 });

  const { scrollY } = useScroll();
  
  // Parallax: More visible background parallax, 2x on mobile
  const bgParallaxRange = isMobile ? -1500 : -800;
  const bgY = useTransform(scrollY, [0, 5000], [0, bgParallaxRange]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      if (galleryRef.current) {
        const rect = galleryRef.current.getBoundingClientRect();
        setIsInGallery(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Flashlight Dimming Effect
  useEffect(() => {
    let dimTimer;
    
    const handleInteraction = () => {
      flashlightOpacity.set(1);
      if (dimTimer) clearTimeout(dimTimer);
      
      // Dim after 1.5s of no interaction
      dimTimer = setTimeout(() => {
        flashlightOpacity.set(0.1);
      }, 1500);
    };

    if (isMobile) {
      window.addEventListener('touchstart', handleInteraction, { passive: true });
      window.addEventListener('touchmove', handleInteraction, { passive: true });
    } else {
      window.addEventListener('mousemove', (e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        handleInteraction();
      });
      window.addEventListener('scroll', handleInteraction, { passive: true });
    }

    // Initial timer
    handleInteraction();

    return () => {
      if (dimTimer) clearTimeout(dimTimer);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('touchmove', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, [isMobile]);

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden selection:bg-lu-gold selection:text-black">
      {/* Optimized Tiled & Parallax Background */}
      <motion.div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{ 
          backgroundImage: `url(${rockTexture})`,
          backgroundRepeat: 'repeat',
          backgroundSize: isMobile ? '400px' : '800px',
          y: bgY
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
        globalMouseX={smoothMouseX} 
        globalMouseY={smoothMouseY} 
        flashlightOpacity={smoothFlashlightOpacity}
      />

      <main className="relative z-10 flex flex-col items-center pt-[30vh] pb-[20vh] w-full">
        
        {/* Hero */}
        <section className="mb-[60vh] text-center px-6 relative w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="w-full max-w-[90vw] md:max-w-none"
          >
            {/* Reduced Title Size on Mobile */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-[14rem] text-white tracking-[0.1em] md:tracking-[0.3em] mb-4 drop-shadow-2xl uppercase leading-tight">
              LINGUA<br />UNIVERSALIS
            </h1>
            <p className="font-sans text-[8px] md:text-lg text-lu-gold tracking-[0.4em] md:tracking-[1em] uppercase opacity-40 font-extralight">
              {t.hero.subtitle}
            </p>
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-white/5 rounded-full pointer-events-none -z-10 animate-spin-slow" />
        </section>

        {/* Philosophy Section */}
        <section className="w-full max-w-6xl px-8 mb-[50vh] flex flex-col md:flex-row gap-20 items-start">
          <InteractiveElement index={1} globalMouseX={smoothMouseX} globalMouseY={smoothMouseY} isMobile={isMobile} parallaxSpeed={0.5}>
            <div className="relative flex-1">
              <div className="space-y-20">
                <h2 className="font-serif text-5xl md:text-6xl text-lu-gold uppercase tracking-[0.4em] mb-12">
                  {t.sections.philosophy}
                </h2>
                <p className="text-3xl md:text-5xl font-extralight text-white/80 leading-relaxed">
                  {t.hero.philosophy}
                </p>
              </div>
            </div>
          </InteractiveElement>
          <InteractiveElement index={2} globalMouseX={smoothMouseX} globalMouseY={smoothMouseY} isMobile={isMobile} parallaxSpeed={0.8}>
            <div className="flex-1 text-lg md:text-xl text-white/40 leading-loose space-y-12 max-w-md ml-auto border-r border-lu-gold/10 pr-10 font-extralight">
              <p>
                The project is a bridge between the prehistoric (shamanic cave art) and the post-modern (digital cinematic art). Every design element is a piece of a singular, interconnected whole.
              </p>
              <p>
                Today's world has reached an apex of fragmentation. Real connection between cultures is only possible through the universal language of art and our shared human origins.
              </p>
            </div>
          </InteractiveElement>
        </section>

        {/* Gallery */}
        <section ref={galleryRef} className="w-full max-w-7xl px-4 mb-[40vh]">
          <h2 className="text-center font-serif text-4xl text-lu-gold/40 uppercase tracking-[0.5em] mb-48">
            {t.sections.gallery}
          </h2>
          <div className="space-y-32">
            {t.gallery.map((item, i) => (
              <InteractiveImage 
                key={i}
                src={item.img}
                alt={item.title}
                title={item.title}
                subtitle={`${item.location} • ${item.year}`}
                isLeft={i % 2 === 0}
                index={i}
                globalMouseX={smoothMouseX}
                globalMouseY={smoothMouseY}
                isMobile={isMobile}
              />
            ))}
          </div>
        </section>

        {/* Movie Section with Proximity Reveal */}
        <section className="w-full mb-[40vh] flex flex-col items-center px-4">
          <h2 className="font-serif text-4xl text-lu-gold uppercase tracking-[0.5em] mb-20">
            {t.sections.movie}
          </h2>
          <InteractiveElement index={5} globalMouseX={smoothMouseX} globalMouseY={smoothMouseY} isMobile={isMobile}>
            {(isRevealed) => (
              <div className={`relative w-full max-w-6xl aspect-video transition-all duration-1000 ${isRevealed ? 'grayscale-0 brightness-100' : 'grayscale brightness-50 blur-sm'}`}>
                <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none group-hover:bg-transparent transition-colors duration-1000" />
                <div className="absolute inset-0 bg-noise opacity-10 z-20 pointer-events-none animate-grain" />
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                  title="Lingua Universalis Movie"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-lu-gold/10 blur-[120px] rounded-full pointer-events-none" />
              </div>
            )}
          </InteractiveElement>
        </section>

        {/* Team Section */}
        <section className="w-full max-w-5xl px-8 mb-[40vh]">
          <h2 className="text-center font-serif text-5xl text-lu-gold uppercase tracking-[0.3em] mb-64">
            {t.sections.team}
          </h2>
          <div>
            {t.participants.map((member, i) => (
              <InteractiveImage 
                key={member.id}
                src={member.img}
                alt={member.name}
                title={member.name}
                subtitle={member.role}
                quote={member.quote}
                isLeft={i % 2 === 0}
                index={i + 10}
                globalMouseX={smoothMouseX}
                globalMouseY={smoothMouseY}
                isMobile={isMobile}
              />
            ))}
          </div>
        </section>

        {/* Events & Contact */}
        <section className="w-full max-w-5xl px-8 flex flex-col items-center">
           <h2 className="font-serif text-4xl text-lu-gold uppercase tracking-[0.5em] mb-24">
            {t.sections.events}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 w-full">
            {t.events.list.map((event, i) => (
              <InteractiveElement key={i} index={i} globalMouseX={smoothMouseX} globalMouseY={smoothMouseY} isMobile={isMobile} parallaxSpeed={0.3}>
                <div className="space-y-6 border-t border-lu-gold/10 pt-12">
                  <h3 className="font-serif text-2xl text-white font-extralight">{event.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-lu-gold tracking-widest uppercase font-extralight">
                    <MapPin size={14} /> {event.location}
                  </div>
                  <p className="text-base text-white/40 leading-relaxed font-extralight">{event.desc}</p>
                  <a 
                    href={event.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 text-xs text-lu-gold uppercase tracking-[0.3em] border border-lu-gold/30 px-6 py-3 hover:bg-lu-gold hover:text-black transition-all font-extralight"
                  >
                    Explore <ExternalLink size={12} />
                  </a>
                </div>
              </InteractiveElement>
            ))}
          </div>
          
          <div className="mt-[40vh] text-center space-y-12">
             <div className="h-32 w-[1px] bg-gradient-to-b from-transparent to-lu-gold/50 mx-auto" />
             <p className="text-xs tracking-[0.8em] text-white/20 uppercase font-extralight">{t.footer.contacts}</p>
             <h4 className="font-serif text-lu-gold text-2xl tracking-widest font-extralight">{t.footer.text}</h4>
          </div>
        </section>

      </main>
    </div>
  );
};

export default App;
