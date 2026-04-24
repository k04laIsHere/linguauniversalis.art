import { useMemo, useState, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { useViewMode } from '../../contexts/ViewModeContext';
import { scrollToId } from '../../utils/scroll';
import { useActiveSection } from './useActiveSection';
import { gsap, ScrollTrigger } from '../../animation/gsap';
import styles from './Header.module.css';

type NavItem = { id: string; label: string };

export function Header() {
  const { lang, setLang, t } = useI18n();
  const { mode, toggleMode } = useViewMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Darkening logic for exit flight section
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '#exitFlight',
        start: 'top 80%', // Start darkening as we approach exitFlight
        endTrigger: '#team',
        end: 'top 20%', // Max darkness before team section starts
        scrub: true,
        onUpdate: (self) => {
          header.style.setProperty('--shard-darkness', (self.progress * 0.4).toString());
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const items: NavItem[] = useMemo(
    () => [
      { id: 'manifesto', label: t.header.manifesto },
      { id: 'ancient', label: t.header.ancient },
      { id: 'team', label: t.header.team },
      { id: 'events', label: t.header.events },
      { id: 'gallery', label: t.header.gallery },
      { id: 'contact', label: t.header.contact },
    ],
    [t],
  );

  const active = useActiveSection(items.map((i) => i.id));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const languages: { code: typeof lang; label: string }[] = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ];

  return (
    <header 
      ref={headerRef}
      className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''} ${isOpen ? styles.headerOpen : ''}`}
    >
      <div className={styles.headerInner}>
        <div className={styles.brand} onClick={() => scrollToId('manifesto')}>
          <div className={styles.brandTitle}>Lingua Universalis</div>
          <div className={styles.brandHint}>{t.header.brandHint}</div>
        </div>

        <nav className={styles.desktopNav} aria-label="Desktop Site">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.desktopNavBtn} ${active === item.id ? styles.desktopNavBtnActive : ''}`}
              onClick={() => scrollToId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.desktopRight}>
          {/* Returning to Archive from Immersive mode */}
          {mode === 'immersive' && (
            <button
              type="button"
              className={`${styles.viewListBtn} ${styles.desktopOnly}`}
              onClick={toggleMode}
              aria-label="View Archive"
            >
              {t.header.backToArchive}
            </button>
          )}

          <div className={styles.langContainer}>
            <button
              type="button"
              className={styles.langToggleSingle}
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-label="Toggle Language"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.globeIcon}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className={styles.langCode}>{lang.toUpperCase()}</span>
            </button>
            
            {isLangOpen && (
              <div className={styles.langDropdown}>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    className={`${styles.dropdownItem} ${lang === l.code ? styles.dropdownItemActive : ''}`}
                    onClick={() => {
                      setLang(l.code);
                      setIsLangOpen(false);
                    }}
                  >
                    {l.label === 'RU' ? 'Русский' : l.label === 'EN' ? 'English' : 'Español'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={styles.menuToggle}
            onClick={toggleMenu}
            aria-label="Toggle Navigation"
          >
            <span className={styles.menuIcon} />
          </button>
        </div>
      </div>

      <div className={styles.overlay} onClick={() => setIsOpen(false)}>
        <nav className={styles.nav} aria-label="Mobile Site" onClick={(e) => e.stopPropagation()}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navBtn} ${active === item.id ? styles.navBtnActive : ''}`}
              onClick={() => {
                scrollToId(item.id);
                setIsOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
          
          <div className={styles.mobileLangRow}>
            {languages.map((l) => (
              <button
                key={l.code}
                className={`${styles.mobileLangBtn} ${lang === l.code ? styles.mobileLangBtnActive : ''}`}
                onClick={() => {
                  setLang(l.code);
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* View as List Button - Mobile Menu Only */}
          {mode === 'immersive' && (
            <button
              type="button"
              className={styles.mobileViewListBtn}
              onClick={() => {
                toggleMode();
                setIsOpen(false);
              }}
            >
              {t.header.backToArchive}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
