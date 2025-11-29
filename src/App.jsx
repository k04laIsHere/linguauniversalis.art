import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Globe, ArrowRight, ExternalLink, Calendar, MapPin, ChevronDown } from 'lucide-react';
import { content } from './data/content';

// Import hero background
import heroBg from '../assets/images/background.jpg';

// Import event images
import image1 from '../assets/images/image 1.jpg';
import image2 from '../assets/images/image-2.jpg';

// --- Loading Screen Component ---
const LoadingScreen = ({ onLoadComplete, isBgLoaded }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        // If background isn't loaded, stall at 90%
        if (prev >= 90 && !isBgLoaded) {
          return 90;
        }
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isBgLoaded]);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(onLoadComplete, 500);
    }
  }, [progress, onLoadComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
    >
      <div className="w-64 space-y-4">
        <h1 className="font-serif text-2xl text-center tracking-[0.2em] text-lu-gold uppercase">
          Lingua Universalis
        </h1>
        <div className="h-[1px] w-full bg-lu-gray relative overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-lu-gold"
            style={{ width: `${progress}%` }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
        <div className="flex justify-between text-[10px] tracking-widest text-gray-500 uppercase">
          <span>Loading</span>
          <span>{progress}%</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Optimized Background Component ---
const FlashlightBackground = ({ opacity, onBgLoad }) => {
  useEffect(() => {
    const img = new Image();
    img.src = heroBg;
    img.onload = () => {
      onBgLoad(true);
    };
  }, [onBgLoad]);

  return (
    <>
      <div className="fixed inset-0 bg-black -z-20" />
      
      {/* Ambient Layer - controlled by scroll opacity */}
      <motion.div 
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          opacity: opacity 
        }} 
      />

      {/* Flashlight Layer - Always full opacity, revealed by mask */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          opacity: 1,
          maskImage: `radial-gradient(circle 450px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 450px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)`
        }}
      />
    </>
  );
};

// --- Components ---

const Navbar = ({ lang, setLang, t, isOpen, setIsOpen }) => (
  <nav className="fixed top-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-center mix-blend-difference text-white">
    <div className="font-serif text-2xl tracking-[0.2em] uppercase font-bold relative group cursor-pointer">
      <span className="relative z-10">Lingua Universalis</span>
      <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-lu-gold group-hover:w-full transition-all duration-500"></span>
    </div>
    
    <div className="flex items-center gap-12">
      <button 
        onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
        className="flex items-center gap-2 text-xs tracking-[0.2em] hover:text-lu-gold transition-colors uppercase font-light"
      >
        <Globe size={14} />
        {lang}
      </button>
      
      <button 
        className="md:hidden z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <ul className="hidden md:flex gap-12 text-xs tracking-[0.2em] uppercase font-light">
        <li><a href="#about" className="hover:text-lu-gold transition-colors duration-300">{t.nav.about}</a></li>
        <li><a href="#events" className="hover:text-lu-gold transition-colors duration-300">{t.nav.events}</a></li>
        <li><a href="#participants" className="hover:text-lu-gold transition-colors duration-300">{t.nav.participants}</a></li>
      </ul>
    </div>

    {/* Mobile Menu Overlay */}
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-12 md:hidden z-40"
      >
        <a href="#about" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-lu-gold">{t.nav.about}</a>
        <a href="#events" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-lu-gold">{t.nav.events}</a>
        <a href="#participants" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-lu-gold">{t.nav.participants}</a>
      </motion.div>
    )}
  </nav>
);

const Hero = ({ t }) => {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-6xl mx-auto flex flex-col items-center mix-blend-screen">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative mb-12"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-normal tracking-widest leading-none text-white drop-shadow-2xl">
            LINGUA<br />UNIVERSALIS
          </h1>
          <div className="absolute -right-8 -top-8 w-24 h-24 border-t border-r border-lu-gold/50 hidden md:block"></div>
          <div className="absolute -left-8 -bottom-8 w-24 h-24 border-b border-l border-lu-gold/50 hidden md:block"></div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-sans text-xs md:text-sm tracking-[0.3em] text-lu-text/80 uppercase mb-16 max-w-xl leading-loose shadow-black drop-shadow-md"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <ChevronDown className="text-lu-gold/80 animate-bounce w-8 h-8" />
        </motion.div>
      </div>
    </section>
  );
};

const About = ({ t }) => (
  <section id="about" className="min-h-screen py-32 px-6 relative flex items-center">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center w-full">
      <div className="lg:col-span-5 space-y-12 order-2 lg:order-1 relative z-10 pointer-events-none">
        <div className="pointer-events-auto">
           <span className="text-lu-gold text-xs tracking-[0.3em] uppercase mb-4 block">Manifesto</span>
          <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight mb-8">
            {t.about.title}
          </h2>
          <div className="space-y-8 font-light text-lg leading-relaxed text-gray-300">
            {t.about.text.map((paragraph, idx) => (
              <p key={idx} className="first-letter:text-5xl first-letter:font-serif first-letter:text-lu-gold first-letter:mr-2 first-letter:float-left">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 relative order-1 lg:order-2 pointer-events-auto">
        <div className="relative z-10 w-full aspect-[4/5] lg:aspect-square max-w-xl mx-auto">
           <div className="absolute inset-0 border border-lu-gold/20 transform rotate-3 scale-105"></div>
           <div className="absolute inset-0 border border-lu-gold/10 transform -rotate-3 scale-95"></div>
           <div className="w-full h-full overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
              <img 
                src={t.about.image} 
                alt="Art" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-lu-dark/80 to-transparent opacity-50"></div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

const EventSection = ({ event, index, isReversed }) => (
  <section className="min-h-screen relative flex items-center justify-center py-24 overflow-hidden border-t border-white/5">
    <div className="container mx-auto px-6 relative z-10 pointer-events-none">
      <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 lg:gap-32 items-center`}>
        
        <div className="w-full lg:w-1/2 relative group pointer-events-auto">
          <div className="relative aspect-video overflow-hidden bg-lu-gray/20">
            <img 
              src={index % 2 === 0 ? image2 : image1} 
              alt={event.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 border border-white/10 pointer-events-none"></div>
          </div>
          
          <div className="absolute -top-6 -left-6 bg-lu-dark border border-lu-gold/30 p-6 backdrop-blur-md">
             <span className="block font-serif text-3xl text-lu-gold">{event.date.split(' ')[0]}</span>
             <span className="block text-xs uppercase tracking-widest text-gray-400 mt-1">{event.date.split(' ').slice(1).join(' ')}</span>
          </div>
        </div>

        <div className="w-full lg:w-1/2 space-y-8 pointer-events-auto">
           <div className="flex items-center gap-4 text-lu-gold/60 text-xs uppercase tracking-[0.2em]">
              <span className="w-8 h-[1px] bg-lu-gold/60"></span>
              <span>Event {index + 1}</span>
           </div>
           
           <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-white group-hover:text-lu-gold transition-colors duration-300">
             {event.title}
           </h2>

           <div className="flex items-start gap-3 text-sm text-gray-400 font-light tracking-wider">
              <MapPin size={16} className="mt-1 shrink-0 text-lu-gold" />
              <span>{event.location}</span>
           </div>

           <p className="text-lg font-light text-gray-300 leading-relaxed max-w-md">
             {event.desc}
           </p>

           <div className="pt-4">
             <a 
                href={event.link}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-white hover:text-lu-gold transition-colors group"
             >
                Check Details
                <span className="w-12 h-[1px] bg-white/30 group-hover:bg-lu-gold transition-colors"></span>
             </a>
           </div>
        </div>

      </div>
    </div>
  </section>
);

const EventsList = ({ t }) => (
  <div id="events">
    {t.events.list.map((event, index) => (
      <EventSection 
        key={index} 
        event={event} 
        index={index} 
        isReversed={index % 2 !== 0} 
      />
    ))}
  </div>
);

const ParticipantCard = ({ p, index, mouseX, mouseY }) => {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const isInView = useInView(ref, { margin: "-20%" }); // Viewport detection for mobile

  useEffect(() => {
    // Mobile Scroll Logic: Activate when in view
    if (window.matchMedia("(max-width: 768px)").matches) {
      setIsActive(isInView);
      return;
    }

    // Desktop Hover Logic: Immediate proximity check
    const checkProximity = (x, y) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      // Increased radius to 200px beyond center (effectively making hit area much larger)
      // Actually user said 200px *around* image. 
      // Center distance threshold = Width/2 + 200px roughly.
      const threshold = Math.max(rect.width, rect.height) / 2 + 200;
      
      setIsActive(dist < threshold);
    };

    const unsubscribeX = mouseX.on("change", (latestX) => {
      checkProximity(latestX, mouseY.get());
    });
    const unsubscribeY = mouseY.on("change", (latestY) => {
      checkProximity(mouseX.get(), latestY);
    });

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [isInView, mouseX, mouseY]);

  return (
    <div 
      ref={ref}
      className="relative flex flex-col gap-6"
    >
      <div 
        className={`aspect-[4/5] overflow-hidden bg-lu-gray/10 relative transition-all duration-700 ${isActive ? 'grayscale-0 scale-105' : 'grayscale scale-100'}`}
      >
        <img 
          src={p.img} 
          alt={p.name} 
          className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lu-dark via-transparent to-transparent opacity-60"></div>
        
        <div className={`absolute inset-0 flex items-end p-6 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs uppercase tracking-widest text-lu-gold/80">{p.role}</p>
        </div>
      </div>

      <div className={`space-y-3 border-t border-white/10 pt-6 transition-colors duration-500 ${isActive ? 'border-lu-gold/50' : ''}`}>
        <h3 className={`font-serif text-2xl transition-colors duration-500 ${isActive ? 'text-lu-gold' : 'text-white'}`}>{p.name}</h3>
        <p className="text-xs text-gray-500 uppercase tracking-widest">{p.country}</p>
        <p className="text-sm text-gray-400 font-light leading-relaxed line-clamp-3">
          {p.desc}
        </p>
      </div>
    </div>
  );
};

const Participants = ({ t, mouseX, mouseY }) => (
  <section id="participants" className="py-32 px-6 relative">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col items-center mb-24 text-center space-y-6">
        <span className="text-lu-gold text-xs tracking-[0.4em] uppercase">Collective</span>
        <h2 className="font-serif text-5xl md:text-7xl text-white">{t.participants.title}</h2>
        <div className="w-px h-24 bg-gradient-to-b from-lu-gold to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
        {t.participants.list.map((p, index) => (
          <ParticipantCard key={index} p={p} index={index} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>
    </div>
  </section>
);

const Footer = ({ t }) => (
  <footer className="bg-black py-24 px-6 border-t border-white/5 relative overflow-hidden">
    <div className="absolute inset-0 bg-noise opacity-5"></div>
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 relative z-10">
      <div>
        <div className="font-serif text-4xl text-lu-gold mb-4">Lingua Universalis</div>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-600">The Art of Creation</p>
      </div>
      <div className="text-sm text-gray-500 font-light text-left md:text-right space-y-2">
        <p className="hover:text-white transition-colors">{t.footer.contacts}</p>
        <p className="text-gray-700">{t.footer.text}</p>
      </div>
    </div>
  </footer>
);

function App() {
  const [lang, setLang] = useState('ru');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBgLoaded, setIsBgLoaded] = useState(false);
  const t = content[lang];

  // --- Flashlight Physics Logic ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Very fast spring for instant-feel smoothness
  const smoothMouseX = useSpring(mouseX, { damping: 20, stiffness: 300, mass: 0.5 });
  const smoothMouseY = useSpring(mouseY, { damping: 20, stiffness: 300, mass: 0.5 });

  // Sync springs to CSS variables for performant rendering
  useEffect(() => {
    // Set initial position
    document.documentElement.style.setProperty('--mouse-x', '50%');
    document.documentElement.style.setProperty('--mouse-y', '50%');

    const unsubscribeX = smoothMouseX.on("change", (latest) => {
      document.documentElement.style.setProperty('--mouse-x', `${latest}px`);
    });
    
    const unsubscribeY = smoothMouseY.on("change", (latest) => {
      document.documentElement.style.setProperty('--mouse-y', `${latest}px`);
    });

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [smoothMouseX, smoothMouseY]);

  // Scroll opacity logic using Framer Motion (replaces Canvas logic)
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, window.innerHeight], [0.6, 0.3]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const handleTouchMove = (e) => {
       if (e.touches.length > 0) {
         mouseX.set(e.touches[0].clientX);
         mouseY.set(e.touches[0].clientY);
       }
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const NoiseOverlay = () => (
    <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.04] mix-blend-overlay"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
  );

  return (
    <div className="bg-black min-h-screen text-lu-text selection:bg-lu-gold selection:text-black overflow-x-hidden">
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen 
            isBgLoaded={isBgLoaded} 
            onLoadComplete={() => setIsLoading(false)} 
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        <NoiseOverlay />
        
        {/* Optimized CSS Background */}
        <FlashlightBackground 
          opacity={bgOpacity}
          onBgLoad={setIsBgLoaded}
        />

        <Navbar lang={lang} setLang={setLang} t={t} isOpen={isOpen} setIsOpen={setIsOpen} />
        
        <main className="relative z-10">
          <Hero t={t} />
          <div className="relative"> 
             <About t={t} />
             <EventsList t={t} />
             <Participants t={t} mouseX={smoothMouseX} mouseY={smoothMouseY} />
          </div>
        </main>

        <Footer t={t} />
      </motion.div>
    </div>
  );
}

export default App;
