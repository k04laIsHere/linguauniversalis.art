import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ArrowRight, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { content } from './data/content';

// Components
const Navbar = ({ lang, setLang, t, isOpen, setIsOpen }) => (
  <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference text-white">
    <div className="font-cormorant text-2xl tracking-widest uppercase font-bold">
      Lingua Universalis
    </div>
    
    <div className="flex items-center gap-8">
      <button 
        onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
        className="flex items-center gap-2 text-sm tracking-widest hover:text-lu-gold transition-colors uppercase"
      >
        <Globe size={16} />
        {lang}
      </button>
      
      <button 
        className="md:hidden z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <ul className="hidden md:flex gap-8 text-sm tracking-widest uppercase">
        <li><a href="#about" className="hover:text-lu-gold transition-colors">{t.nav.about}</a></li>
        <li><a href="#events" className="hover:text-lu-gold transition-colors">{t.nav.events}</a></li>
        <li><a href="#participants" className="hover:text-lu-gold transition-colors">{t.nav.participants}</a></li>
      </ul>
    </div>

    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="fixed inset-0 bg-lu-dark flex flex-col items-center justify-center gap-8 md:hidden"
        >
          <a href="#about" onClick={() => setIsOpen(false)} className="text-2xl font-cormorant">{t.nav.about}</a>
          <a href="#events" onClick={() => setIsOpen(false)} className="text-2xl font-cormorant">{t.nav.events}</a>
          <a href="#participants" onClick={() => setIsOpen(false)} className="text-2xl font-cormorant">{t.nav.participants}</a>
        </motion.div>
      )}
    </AnimatePresence>
  </nav>
);

const Hero = ({ t }) => (
  <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
    {/* Background with Noise and Gradient */}
    <div className="absolute inset-0 bg-noise opacity-30 z-10 pointer-events-none"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lu-dark/50 to-lu-dark z-10"></div>
    
    {/* Background Image/Video Placeholder */}
    <div className="absolute inset-0 z-0">
      <img 
        src={t.hero.image} 
        alt="Background" 
        className="w-full h-full object-cover opacity-40 scale-105 animate-float"
      />
    </div>

    <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="font-cormorant text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-none mb-6 text-lu-gold-light"
      >
        {t.hero.title}
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="font-sans text-sm md:text-base tracking-[0.2em] text-lu-text/80 uppercase mb-12 max-w-2xl mx-auto"
      >
        {t.hero.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <a href="#about" className="inline-flex items-center gap-2 border border-lu-gold/30 px-8 py-3 rounded-full text-sm tracking-widest hover:bg-lu-gold/10 hover:border-lu-gold transition-all group">
          {t.hero.cta} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </div>
    
    {/* Decorative Elements */}
    <div className="absolute bottom-10 left-10 w-px h-24 bg-gradient-to-b from-transparent to-lu-gold/50 hidden md:block"></div>
    <div className="absolute top-32 right-10 w-24 h-px bg-gradient-to-r from-transparent to-lu-gold/50 hidden md:block"></div>
  </section>
);

const About = ({ t }) => (
  <section id="about" className="min-h-screen py-24 px-6 relative overflow-hidden">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
      {/* Asymmetric Layout */}
      <div className="md:col-span-5 relative">
        <div className="aspect-[3/4] bg-lu-gray/20 relative overflow-hidden">
           <img 
            src={t.about.image} 
            alt="Art" 
            className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
          />
        </div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-lu-gold/30 z-10 hidden md:block"></div>
      </div>

      <div className="md:col-span-1"></div>

      <div className="md:col-span-6 space-y-8">
        <h2 className="font-cormorant text-5xl md:text-6xl text-lu-gold italic">
          {t.about.title}
        </h2>
        <div className="space-y-6 font-light text-lg leading-relaxed text-lu-text/90">
          {t.about.text.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
        <div className="pt-8">
           <div className="h-px w-24 bg-lu-gold"></div>
        </div>
      </div>
    </div>
  </section>
);

const Events = ({ t }) => (
  <section id="events" className="py-24 px-6 bg-lu-gray/10">
    <div className="max-w-7xl mx-auto">
      <h2 className="font-cormorant text-5xl md:text-6xl mb-16 text-center">{t.events.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {t.events.list.map((event, index) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={index} 
            className="group relative border border-lu-gold/10 bg-lu-dark/40 p-8 hover:border-lu-gold/40 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="text-lu-gold" size={20} />
            </div>
            
            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 text-lu-gold text-sm tracking-widest mb-3 uppercase">
                  <Calendar size={14} />
                  <span>{event.date}</span>
                </div>
                <h3 className="font-cormorant text-3xl md:text-4xl mb-4 leading-tight group-hover:text-lu-gold transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-start gap-2 text-sm text-gray-400 mb-4">
                  <MapPin size={14} className="mt-1 shrink-0" />
                  <span>{event.location}</span>
                </div>
                <p className="text-gray-400 font-light leading-relaxed">
                  {event.desc}
                </p>
              </div>
              
              <a 
                href={event.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-sm uppercase tracking-widest border-b border-lu-gold/30 pb-1 hover:border-lu-gold hover:text-lu-gold transition-all w-max"
              >
                Подробнее
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const ParticipantCard = ({ p }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className="group relative"
  >
    <div className="aspect-[3/4] overflow-hidden bg-lu-gray/20 mb-4 relative">
      <div className="absolute inset-0 bg-lu-gold/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay"></div>
      <img 
        src={p.img} 
        alt={p.name} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
      />
    </div>
    <div className="space-y-2">
      <h3 className="font-cormorant text-2xl text-lu-text group-hover:text-lu-gold transition-colors">{p.name}</h3>
      <p className="text-xs uppercase tracking-widest text-lu-gold/80">{p.role}</p>
      <p className="text-xs text-gray-500">{p.country}</p>
      <p className="text-sm text-gray-400 font-light mt-2 line-clamp-3 group-hover:line-clamp-none transition-all">
        {p.desc}
      </p>
    </div>
  </motion.div>
);

const Participants = ({ t }) => (
  <section id="participants" className="py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <h2 className="font-cormorant text-5xl md:text-6xl">{t.participants.title}</h2>
        <p className="max-w-md text-right text-sm font-light text-gray-400 hidden md:block">
          Художники из разных стран, объединенные идеей универсального языка искусства.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {t.participants.list.map((p, index) => (
          <ParticipantCard key={index} p={p} />
        ))}
      </div>
    </div>
  </section>
);

const Footer = ({ t }) => (
  <footer className="bg-black py-12 px-6 border-t border-white/10">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="font-cormorant text-2xl text-lu-gold">Lingua Universalis</div>
      <div className="text-sm text-gray-500 font-light text-center md:text-right">
        <p>{t.footer.contacts}</p>
        <p className="mt-2">{t.footer.text}</p>
      </div>
    </div>
  </footer>
);

function App() {
  const [lang, setLang] = useState('ru');
  const [isOpen, setIsOpen] = useState(false);
  const t = content[lang];

  // Simple noise overlay component
  const NoiseOverlay = () => (
    <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.03] mix-blend-overlay"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
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
