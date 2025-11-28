import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Menu, X, Globe, ArrowRight, ExternalLink, Calendar, MapPin, ChevronDown } from 'lucide-react';
import { content } from './data/content';

// Use the requested background image
import heroBg from '../assets/images/background.jpg';

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
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-lu-dark">
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Background" 
          className="w-full h-full object-cover scale-105"
        />
        {/* Mouse Follow Glow Effect - Flashlight style */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 215, 0, 0.2), transparent 60%)`
          }}
        />
         <div 
          className="absolute inset-0 pointer-events-none z-10 mix-blend-screen"
          style={{
            background: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.1), transparent 70%)`
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-6xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative mb-12"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-normal tracking-widest leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-lu-gold to-lu-gold-dim drop-shadow-2xl">
            LINGUA<br />UNIVERSALIS
          </h1>
          <div className="absolute -right-8 -top-8 w-24 h-24 border-t border-r border-lu-gold/30 hidden md:block"></div>
          <div className="absolute -left-8 -bottom-8 w-24 h-24 border-b border-l border-lu-gold/30 hidden md:block"></div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="font-sans text-xs md:text-sm tracking-[0.3em] text-lu-text uppercase mb-16 max-w-xl leading-loose shadow-black drop-shadow-md"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <ChevronDown className="text-lu-gold/80 animate-bounce w-8 h-8" />
        </motion.div>
      </div>
    </section>
  );
};

const About = ({ t }) => (
  <section id="about" className="min-h-screen py-32 px-6 relative bg-lu-dark flex items-center">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center w-full">
      {/* Asymmetric Layout - Text First on Large Screens */}
      <div className="lg:col-span-5 space-y-12 order-2 lg:order-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
           <span className="text-lu-gold text-xs tracking-[0.3em] uppercase mb-4 block">Manifesto</span>
          <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight mb-8">
            {t.about.title}
          </h2>
          <div className="space-y-8 font-light text-lg leading-relaxed text-gray-400">
            {t.about.text.map((paragraph, idx) => (
              <p key={idx} className="first-letter:text-5xl first-letter:font-serif first-letter:text-lu-gold first-letter:mr-2 first-letter:float-left">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Image Section with "Sacred" Geometry */}
      <div className="lg:col-span-7 relative order-1 lg:order-2">
        <div className="relative z-10 w-full aspect-[4/5] lg:aspect-square max-w-xl mx-auto">
           <div className="absolute inset-0 border border-lu-gold/20 transform rotate-3 scale-105"></div>
           <div className="absolute inset-0 border border-lu-gold/10 transform -rotate-3 scale-95"></div>
           <motion.div 
             className="w-full h-full overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-1000"
             initial={{ clipPath: 'inset(10% 10% 10% 10%)' }}
             whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
             transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
           >
              <img 
                src={t.about.image} 
                alt="Art" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-lu-dark/80 to-transparent opacity-50"></div>
           </motion.div>
        </div>
        {/* Abstract Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lu-gold/5 blur-[80px] -z-10"></div>
      </div>
    </div>
  </section>
);

const EventSection = ({ event, index, isReversed }) => (
  <section className="min-h-screen relative flex items-center justify-center py-24 overflow-hidden border-t border-white/5">
    {/* Background Elements */}
    <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
    
    <div className="container mx-auto px-6 relative z-10">
      <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 lg:gap-32 items-center`}>
        
        {/* Image Content */}
        <motion.div 
          className="w-full lg:w-1/2 relative group"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="relative aspect-video overflow-hidden bg-lu-gray/20">
            <img 
              src={index % 2 === 0 ? "/assets/images/image-2.jpg" : "/assets/images/image 1.jpg"} 
              alt={event.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 border border-white/10 pointer-events-none"></div>
          </div>
          
          {/* Floating Date Badge */}
          <div className="absolute -top-6 -left-6 bg-lu-dark border border-lu-gold/30 p-6 backdrop-blur-md">
             <span className="block font-serif text-3xl text-lu-gold">{event.date.split(' ')[0]}</span>
             <span className="block text-xs uppercase tracking-widest text-gray-400 mt-1">{event.date.split(' ').slice(1).join(' ')}</span>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div 
          className="w-full lg:w-1/2 space-y-8"
          initial={{ opacity: 0, x: isReversed ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
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
        </motion.div>

      </div>
    </div>
  </section>
);

const Events = ({ t }) => (
  <div id="events" className="bg-lu-dark">
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

const ParticipantCard = ({ p, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay: index * 0.1 }}
    className="group relative flex flex-col gap-6"
  >
    <div className="aspect-[4/5] overflow-hidden bg-lu-gray/10 relative grayscale group-hover:grayscale-0 transition-all duration-700">
      <img 
        src={p.img} 
        alt={p.name} 
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-lu-dark via-transparent to-transparent opacity-60"></div>
      
      {/* Hover Overlay with Name */}
      <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <p className="text-xs uppercase tracking-widest text-lu-gold/80">{p.role}</p>
      </div>
    </div>

    <div className="space-y-3 border-t border-white/10 pt-6 group-hover:border-lu-gold/50 transition-colors">
      <h3 className="font-serif text-2xl text-white group-hover:text-lu-gold transition-colors">{p.name}</h3>
      <p className="text-xs text-gray-500 uppercase tracking-widest">{p.country}</p>
      <p className="text-sm text-gray-400 font-light leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
        {p.desc}
      </p>
    </div>
  </motion.div>
);

const Participants = ({ t }) => (
  <section id="participants" className="py-32 px-6 bg-[#020202] relative">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col items-center mb-24 text-center space-y-6">
        <span className="text-lu-gold text-xs tracking-[0.4em] uppercase">Collective</span>
        <h2 className="font-serif text-5xl md:text-7xl text-white">{t.participants.title}</h2>
        <div className="w-px h-24 bg-gradient-to-b from-lu-gold to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
        {t.participants.list.map((p, index) => (
          <ParticipantCard key={index} p={p} index={index} />
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
  const t = content[lang];

  // Noise overlay
  const NoiseOverlay = () => (
    <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.04] mix-blend-overlay"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
  );

  return (
    <div className="bg-lu-dark min-h-screen text-lu-text selection:bg-lu-gold selection:text-black">
      <NoiseOverlay />
      <Navbar lang={lang} setLang={setLang} t={t} isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <main>
        <Hero t={t} />
        <About t={t} />
        <Events t={t} />
        <Participants t={t} />
      </main>

      <Footer t={t} />
    </div>
  );
}

export default App;
