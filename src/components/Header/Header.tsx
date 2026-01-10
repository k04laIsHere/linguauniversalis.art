import { useMemo, useState, useEffect } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { scrollToId } from '../../utils/scroll';
import { useActiveSection } from './useActiveSection';
import styles from './Header.module.css';

type NavItem = { id: string; label: string };

export function Header() {
  const { lang, setLang, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const items: NavItem[] = useMemo(
    () => [
      { id: 'cave', label: t.header.cave },
      { id: 'manifesto', label: t.header.manifesto },
      { id: 'ancient', label: t.header.ancient },
      { id: 'exitFlight', label: t.header.exit },
      { id: 'team', label: t.header.team },
      { id: 'events', label: t.header.events },
      { id: 'natureUrban', label: t.header.natureUrban },
      { id: 'gallery', label: t.header.gallery },
      { id: 'contact', label: t.header.contact },
    ],
    [t],
  );

  const active = useActiveSection(items.map((i) => i.id));

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''} ${isOpen ? styles.headerOpen : ''}`}>
      <div className={styles.brand} onClick={() => scrollToId('cave')}>
        <div className={styles.brandTitle}>Lingua Universalis</div>
        <div className={styles.brandHint}>{t.header.brandHint}</div>
      </div>

      <button 
        className={styles.menuToggle} 
        onClick={toggleMenu}
        aria-label="Toggle Navigation"
      >
        <span className={styles.menuIcon} />
      </button>

      <div className={styles.overlay} onClick={() => setIsOpen(false)}>
        <nav className={styles.nav} aria-label="Site" onClick={(e) => e.stopPropagation()}>
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
        </nav>

        <div className={styles.right} onClick={(e) => e.stopPropagation()}>
          <div className={styles.langToggle} aria-label="Language">
            <button
              type="button"
              className={`${styles.langBtn} ${lang === 'ru' ? styles.langBtnActive : ''}`}
              onClick={() => setLang('ru')}
            >
              RU
            </button>
            <button
              type="button"
              className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


