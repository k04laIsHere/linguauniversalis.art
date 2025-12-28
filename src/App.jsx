import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { Globe, Eye, MapPin, ExternalLink, Info } from 'lucide-react';
import { content } from './data/content';

// Assets
import rockTexture from '../assets/rock-texture.jpg';
import noiseGrain from '../assets/noise-grain.png';
import rockEdgeLeft from '../assets/rock-edge-left.png';
import rockEdgeRight from '../assets/rock-edge-right.png';

// --- Components ---

const Flashlight = ({ isMobile, isInGallery }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const opacity = useMotionValue(1);
  
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200 });
  const smoothOpacity = useSpring(opacity, { damping: 40, stiffness: 100 });

  const timerRef = useRef(null);

  useEffect(() => {
    if (isMobile) {
      const handleTouch = () => {
        opacity.set(1);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          opacity.set(0.1); // Fade to dark
        }, 1500);
      };

      window.addEventListener('touchstart', handleTouch);
      window.addEventListener('touchmove', handleTouch);
      window.addEventListener('touchend', handleTouch);
      
      // Initial trigger
      handleTouch();

      return () => {
        window.removeEventListener('touchstart', handleTouch);
        window.removeEventListener('touchmove', handleTouch);
        window.removeEventListener('touchend', handleTouch);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      const handleMouseMove = (e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile, mouseX, mouseY, opacity]);

  // Sizes: Four times bigger + expansion in gallery
  const baseSize = isMobile ? 400 : 800; // 4x increase from previous ~100-200
  const expandedSize = isMobile ? 800 : 1600;
  
  const size = isInGallery ? expandedSize : baseSize;
  const smoothSize = useSpring(size, { damping: 30, stiffness: 50 });

  const x = isMobile ? '50%' : useMotionTemplate`${smoothX}px`;
  const y = isMobile ? '50%' : useMotionTemplate`${smoothY}px`;
  const radius = useMotionTemplate`${smoothSize}px`;

  // More blurred: increased 80% to 95% for the core, and larger falloff
  const maskImage = useMotionTemplate`radial-gradient(circle ${radius} at ${x} ${y}, transparent 0%, rgba(0,0,0,0.95) 90%, black 100%)`;

  return (
    <motion.div 
      className="fixed inset-0 z-[100] pointer-events-none bg-black"
      style={{ 
        maskImage,
        WebkitMaskImage: maskImage,
        opacity: smoothOpacity
      }}
    >
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay animate-grain"
        style={{ backgroundImage: `url(${noiseGrain})` }}
      />
    </motion.div>
  );
};

const ArtPiece = ({ item, index }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [100, -100]), { stiffness: 50, damping: 20 });
  
  return (
    <motion.div 
      ref={ref}
      style={{ y }}
      className={`relative group mb-32 flex ${index % 2 === 0 ? 'justify-start ml-[10%]' : 'justify-end mr-[10%]'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative max-w-2xl">
        {/* Gallery Image: Circular mask before blur */}
        <div className="overflow-hidden rounded-full aspect-square md:aspect-auto md:rounded-3xl">
          <img 
            src={item.img} 
            alt={item.title}
            className="w-full grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-in-out"
            style={{
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)'
            }}
          />
        </div>
        
        <AnimatePresence>
          {hovered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -bottom-16 left-0 right-0 text-center"
            >
              <div className="font-serif text-lu-gold text-2xl tracking-widest uppercase mb-1 drop-shadow-lg">
                {item.title}
              </div>
              <div className="font-sans text-xs text-white/40 tracking-[0.3em] uppercase">
                {item.location} • {item.year}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const TeamMember = ({ member, index }) => {
  return (
    <div 
      className={`relative mb-48 flex flex-col ${index % 2 === 0 ? 'items-start pl-[10%]' : 'items-end pr-[10%]'}`}
    >
      <div className="relative group max-w-md">
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        {/* Team Portraits: No borders, blurred edges mask */}
        <img 
          src={member.img} 
          alt={member.name}
          className="w-56 h-56 md:w-80 md:h-80 object-cover filter grayscale contrast-125 brightness-50 mix-blend-luminosity transition-all duration-700"
          style={{
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)'
          }}
        />
        <div className="mt-8 space-y-4 max-w-sm">
          <h3 className="font-serif text-3xl text-lu-gold/80 tracking-wider uppercase group-hover:text-lu-gold transition-colors">
            {member.name}
          </h3>
          <p className="font-sans text-xs text-white/30 uppercase tracking-[0.4em] font-light">
            {member.role}
          </p>
          <p className="text-lg text-white/50 font-extralight leading-relaxed italic border-l border-lu-gold/20 pl-6 mt-6">
            {member.quote}
          </p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState('ru');
  const t = content[lang];
  const [isMobile, setIsMobile] = useState(false);
  const [isInGallery, setIsInGallery] = useState(false);
  
  const galleryRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

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

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden selection:bg-lu-gold selection:text-black">
      {/* Fixed Stone Background */}
      <div 
        className="fixed inset-0 z-0 opacity-60 bg-cover bg-center pointer-events-none bg-fixed"
        style={{ backgroundImage: `url(${rockTexture})` }}
      />
      
      {/* Language Switcher */}
      <button 
        onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
        className="fixed top-8 right-8 z-[110] flex items-center gap-2 text-xs tracking-[0.4em] text-white/40 hover:text-lu-gold transition-colors uppercase font-extralight mix-blend-difference"
      >
        <Globe size={14} />
        {lang}
      </button>

      <Flashlight isMobile={isMobile} isInGallery={isInGallery} />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center pt-[30vh] pb-[20vh] w-full">
        
        {/* Hero */}
        <section className="mb-[60vh] text-center px-6 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            <h1 className="font-serif text-8xl md:text-[14rem] text-white tracking-[0.3em] mb-4 drop-shadow-2xl">
              LINGUA<br />UNIVERSALIS
            </h1>
            <p className="font-sans text-sm md:text-lg text-lu-gold tracking-[1em] uppercase opacity-40 font-extralight">
              {t.hero.subtitle}
            </p>
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-white/5 rounded-full pointer-events-none -z-10 animate-spin-slow" />
        </section>

        {/* Philosophy Section - Thin and Large Text */}
        <section className="w-full max-w-6xl px-8 mb-[50vh] flex flex-col md:flex-row gap-20 items-start">
          <div className="relative flex-1">
            <div 
              className="hidden md:block w-72 h-[30rem] float-left shape-outside-rock"
              style={{ 
                shapeOutside: `url(${rockEdgeLeft})`,
                shapeMargin: '4rem'
              }}
            >
               <img src={rockEdgeLeft} className="w-full opacity-20 filter invert brightness-200" alt="" />
            </div>
            <div className="space-y-20">
              <h2 className="font-serif text-6xl text-lu-gold uppercase tracking-[0.4em] mb-12">
                {t.sections.philosophy}
              </h2>
              <p className="text-3xl md:text-5xl font-extralight text-white/80 leading-relaxed md:indent-32">
                {t.hero.philosophy}
              </p>
            </div>
          </div>
          <div className="flex-1 text-lg md:text-xl text-white/40 leading-loose space-y-12 max-w-md ml-auto border-r border-lu-gold/10 pr-10 font-extralight">
            <p>
              The project is a bridge between the prehistoric (shamanic cave art) and the post-modern (digital cinematic art). Every design element is a piece of a singular, interconnected whole.
            </p>
            <p>
              Today's world has reached an apex of fragmentation. Real connection between cultures is only possible through the universal language of art and our shared human origins.
            </p>
          </div>
        </section>

        {/* Gallery */}
        <section ref={galleryRef} className="w-full max-w-7xl px-4 mb-[40vh]">
          <h2 className="text-center font-serif text-4xl text-lu-gold/40 uppercase tracking-[0.5em] mb-48">
            {t.sections.gallery}
          </h2>
          <div className="space-y-32">
            {t.gallery.map((item, i) => (
              <ArtPiece key={i} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* Movie Projection Section */}
        <section className="w-full mb-[40vh] flex flex-col items-center px-4">
           <h2 className="font-serif text-4xl text-lu-gold uppercase tracking-[0.5em] mb-20">
            {t.sections.movie}
          </h2>
          <div className="relative w-full max-w-6xl aspect-video group">
            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none group-hover:bg-transparent transition-colors duration-1000" />
            <div className="absolute inset-0 bg-noise opacity-10 z-20 pointer-events-none animate-grain" />
            <iframe 
              className="w-full h-full grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Lingua Universalis Projection"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-lu-gold/10 blur-[120px] rounded-full pointer-events-none" />
          </div>
        </section>

        {/* Team Section */}
        <section className="w-full max-w-5xl px-8 mb-[40vh]">
          <h2 className="text-center font-serif text-5xl text-lu-gold uppercase tracking-[0.3em] mb-64">
            {t.sections.team}
          </h2>
          <div>
            {t.participants.map((member, i) => (
              <TeamMember key={member.id} member={member} index={i} />
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
              <div key={i} className="space-y-6 border-t border-lu-gold/10 pt-12">
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
            ))}
          </div>
          
          <div className="mt-[40vh] text-center space-y-12">
             <div className="h-32 w-[1px] bg-gradient-to-b from-transparent to-lu-gold/50 mx-auto" />
             <p className="text-xs tracking-[0.8em] text-white/20 uppercase font-extralight">{t.footer.contacts}</p>
             <h4 className="font-serif text-lu-gold text-2xl tracking-widest font-extralight">{t.footer.text}</h4>
          </div>
        </section>

      </main>

      {/* Side Scroll Indicator */}
      <div className="fixed left-8 bottom-8 z-[110] flex flex-col items-center gap-6 mix-blend-difference opacity-20 hover:opacity-100 transition-opacity">
        <div className="h-48 w-[1px] bg-white/20 relative">
          <motion.div 
            className="absolute top-0 left-0 w-full bg-lu-gold"
            style={{ height: useTransform(smoothProgress, [0, 1], ['0%', '100%']) }}
          />
        </div>
        <span className="text-[10px] uppercase tracking-[0.5em] rotate-90 origin-left ml-3 whitespace-nowrap text-white font-extralight">
          The Descent
        </span>
      </div>

    </div>
  );
};

export default App;
