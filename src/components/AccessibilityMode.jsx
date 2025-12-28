// Accessibility Mode Component
// Text-only mode for users with motion sensitivity or screen reader users

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, MapPin } from 'lucide-react';

/**
 * AccessibilityMode - Full-screen text-only overlay
 * @param {boolean} isActive - Whether accessibility mode is active
 * @param {function} onClose - Callback to close the mode
 * @param {object} content - Content object from content.js
 * @param {string} lang - Current language
 */
export function AccessibilityMode({ isActive, onClose, content, lang }) {
  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[300] bg-black overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl mx-auto p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="fixed top-8 right-8 text-white hover:text-lu-gold transition-colors z-10"
            aria-label="Close accessibility mode"
          >
            <X size={24} />
          </button>

          {/* Skip to content links */}
          <nav className="mb-12 bg-black/80 border border-lu-gold/20 p-6 rounded-lg">
            <h2 className="text-2xl font-serif text-lu-gold mb-4">Navigation</h2>
            <ul className="space-y-2 text-white">
              <li>
                <a
                  href="#center"
                  className="hover:text-lu-gold transition-colors underline"
                >
                  Center
                </a>
              </li>
              <li>
                <a
                  href="#manifesto"
                  className="hover:text-lu-gold transition-colors underline"
                >
                  {content.about.title}
                </a>
              </li>
              <li>
                <a
                  href="#participants"
                  className="hover:text-lu-gold transition-colors underline"
                >
                  {content.participants.title}
                </a>
              </li>
              <li>
                <a
                  href="#events"
                  className="hover:text-lu-gold transition-colors underline"
                >
                  {content.events.title}
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-lu-gold transition-colors underline"
                >
                  {content.nav.contacts}
                </a>
              </li>
            </ul>
          </nav>

          {/* Main content */}
          <main className="space-y-16 text-white">
            {/* Center / Hero Section */}
            <section id="center" className="scroll-mt-8">
              <h1 className="font-serif text-4xl md:text-6xl text-white mb-4">
                {content.hero.title}
              </h1>
              <p className="text-xl text-lu-gold uppercase tracking-wider">
                {content.hero.subtitle}
              </p>
            </section>

            {/* Manifesto / About Section */}
            <section id="manifesto" className="scroll-mt-8">
              <h2 className="font-serif text-3xl text-lu-gold mb-6 border-b border-lu-gold/20 pb-4">
                {content.about.title}
              </h2>
              <div className="space-y-4 text-lg text-gray-300 font-light">
                {content.about.text.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Participants Section */}
            <section id="participants" className="scroll-mt-8">
              <h2 className="font-serif text-3xl text-lu-gold mb-6 border-b border-lu-gold/20 pb-4">
                {content.participants.title}
              </h2>
              <ul className="space-y-8">
                {content.participants.list.map((participant, index) => (
                  <li
                    key={index}
                    className="border-b border-white/10 pb-8 last:border-0"
                  >
                    <h3 className="text-2xl font-serif mb-2">{participant.name}</h3>
                    <p className="text-lu-gold text-sm mb-4">
                      {participant.role} - {participant.country}
                    </p>
                    <p className="text-gray-300 font-light">{participant.desc}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Events Section */}
            <section id="events" className="scroll-mt-8">
              <h2 className="font-serif text-3xl text-lu-gold mb-6 border-b border-lu-gold/20 pb-4">
                {content.events.title}
              </h2>
              <ul className="space-y-8">
                {content.events.list.map((event, index) => (
                  <li
                    key={index}
                    className="border-b border-white/10 pb-8 last:border-0"
                  >
                    <h3 className="text-2xl font-serif mb-2">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-lu-gold mb-4">
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                    <p className="text-gray-300 font-light mb-4">{event.desc}</p>
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lu-gold hover:underline inline-flex items-center gap-2 text-sm"
                    >
                      Details <ExternalLink size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {/* Contact Section */}
            <section id="contact" className="scroll-mt-8">
              <h2 className="font-serif text-3xl text-lu-gold mb-6 border-b border-lu-gold/20 pb-4">
                {content.nav.contacts}
              </h2>
              <div className="space-y-4 text-gray-300 font-light">
                <p className="text-xl">{content.footer.contacts}</p>
                <p className="text-sm opacity-60">{content.footer.text}</p>
                <div className="pt-8">
                  <a
                    href="mailto:info@linguauniversalis.art"
                    className="inline-block border border-lu-gold px-8 py-3 text-xs uppercase tracking-widest hover:bg-lu-gold hover:text-black transition-colors"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            <p>{content.footer.text}</p>
          </footer>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
