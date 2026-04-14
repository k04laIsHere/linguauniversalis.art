import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { useViewMode } from '../../contexts/ViewModeContext';
import { teamMembers } from '../../content/teamData';
import { galleryWorks } from '../../content/galleryManifest';
import { events } from '../../content/eventsData';
import { Contact } from '../../sections/Contact';
import { scrollToId } from '../../utils/scroll';
import { useActiveSection } from '../Header/useActiveSection';
import { gsap, ScrollTrigger } from '../../animation/gsap';
import styles from './GalleryMode.module.css';

export function GalleryMode() {
  const { t, lang, setLang } = useI18n();
  const { toggleMode } = useViewMode();
  const collectionSectionRef = useRef<HTMLElement | null>(null);
  const eventsSectionRef = useRef<HTMLElement | null>(null);
  const manifestoSectionRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const languages: { code: Lang; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'es', label: 'ES' },
  ];

  // Dynamically group works by artist based on the current galleryWorks order
  const artistEntries = useMemo(() => {
    const worksByArtist = galleryWorks.reduce((acc, work) => {
      if (!acc[work.artist]) {
        acc[work.artist] = {};
      }
      const medium = work.medium || 'Other';
      if (!acc[work.artist][medium]) {
        acc[work.artist][medium] = [];
      }
      acc[work.artist][medium].push(work);
      return acc;
    }, {} as Record<string, Record<string, typeof galleryWorks>>);

    // Keep the order from galleryWorks (first appearance defines order)
    const uniqueArtists = Array.from(new Set(galleryWorks.map(w => w.artist)));
    return uniqueArtists.map(name => [name, worksByArtist[name]] as [string, Record<string, typeof galleryWorks>]);
  }, [galleryWorks]);

  const navItems = useMemo(() => [
    { id: 'manifesto', label: t.header.manifesto },
    { 
      id: 'works', 
      label: t.header.team,
      children: artistEntries.map(([name]) => ({
        id: `artist-${name.replace(/\s+/g, '-').toLowerCase()}`,
        label: lang === 'ru' ? (
          name === 'Andrey Vaganov' ? 'Андрей Ваганов' :
          name === 'Evgeny Globenko' ? 'Евгений Глобенко' :
          name === 'Petr Tsvetkov' ? 'Петр Цветков' :
          name === 'Omar Godines' ? 'Омар Годинес' :
          name === 'Thomas Harutunyan' ? 'Томас Арутюнян' :
          name === 'Joslen Orsini' ? 'Йослен Орсини' :
          name
        ) : name // For 'en' and 'es' we use the Latin/International name
      }))
    },
    { 
      id: 'events', 
      label: t.header.events,
      children: events.map(e => ({
        id: e.id,
        label: lang === 'ru' ? e.titleRu : e.titleEn
      }))
    },
    { id: 'movie', label: t.header.movie },
    { id: 'contact', label: t.header.contact },
  ], [t, lang, artistEntries]);

  const allNavIds = useMemo(() => {
    const ids = navItems.map(item => item.id);
    navItems.forEach(item => {
      if (item.children) {
        ids.push(...item.children.map(c => c.id));
      }
    });
    return ids;
  }, [navItems]);

  const activeSection = useActiveSection(allNavIds);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleNavClick = (id: string) => {
    scrollToId(id);
    setIsMenuOpen(false);
  };

  // Translation map for mediums
  const mediumTranslations: Record<string, { en: string; ru: string }> = {
    'Digital Art': { en: 'Digital Art', ru: 'Цифровое искусство' },
    'Oil': { en: 'Oil', ru: 'Масло' },
    'Sculpture': { en: 'Sculpture', ru: 'Скульптура' },
    'Acrylic': { en: 'Acrylic', ru: 'Акрил' },
    'Mixed Media': { en: 'Mixed Media', ru: 'Смешанная техника' },
    'Other': { en: 'Other', ru: 'Прочее' }
  };

  const getTranslatedMedium = (medium: string) => {
    return mediumTranslations[medium]?.[lang] || medium;
  };

  // Get team member by name for bio and photo
  const getArtistData = (artistName: string) => {
    const member = teamMembers.find(m => m.name === artistName);
    const translatedName = lang === 'ru' ? (
      member?.name === 'Andrey Vaganov' ? 'Андрей Ваганов' :
      member?.name === 'Evgeny Globenko' ? 'Евгений Глобенко' :
      member?.name === 'Petr Tsvetkov' ? 'Петр Цветков' :
      member?.name === 'Omar Godines' ? 'Омар Годинес' :
      member?.name === 'Thomas Harutunyan' ? 'Томас Арутюнян' :
      member?.name === 'Joslen Orsini' ? 'Йослен Орсини' :
      member?.name
    ) : member?.name;

    return {
      name: translatedName || artistName,
      bio: lang === 'ru' ? member?.blurbRu : member?.blurbEn,
      photo: member?.photoSrc,
    };
  };

  // Setup scroll orchestration
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Artist Blocks (Works Collection)
      const collectionSection = collectionSectionRef.current;
      if (collectionSection) {
        const artistBlocks = gsap.utils.toArray<HTMLElement>(`.${styles.artistBlock}`);
        artistBlocks.forEach((block) => {
          const artistCol = block.querySelector(`.${styles.artistCol}`) as HTMLElement;
          const mediumGroups = gsap.utils.toArray<HTMLElement>(block.querySelectorAll(`.${styles.mediumGroup}`));
          
          // Pin the Artist Info Column
          ScrollTrigger.create({
            trigger: block,
            start: 'top top',
            end: 'bottom bottom',
            pin: artistCol,
            pinSpacing: false,
            invalidateOnRefresh: true,
            refreshPriority: -1,
          });

          // Handle Medium Groups and their Flipping Works
          mediumGroups.forEach((group) => {
            const works = gsap.utils.toArray<HTMLElement>(group.querySelectorAll(`.${styles.workItem}`));
            const progressLabel = group.querySelector(`.${styles.progressLabel}`) as HTMLElement;
            const groupWorksCount = works.length;
            const groupDistance = (groupWorksCount - 1) * window.innerHeight;

            if (groupWorksCount > 1) {
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: group,
                  start: 'top top',
                  end: `+=${groupDistance}`,
                  pin: true,
                  pinSpacing: true,
                  scrub: 1.2,
                  snap: {
                    snapTo: 1 / (groupWorksCount - 1),
                    duration: { min: 0.1, max: 0.3 },
                    delay: 0.02,
                    ease: 'power1.inOut'
                  },
                  invalidateOnRefresh: true,
                  refreshPriority: 1,
                }
              });

              works.forEach((work, i) => {
                gsap.set(work, { 
                  autoAlpha: i === 0 ? 1 : 0, 
                  y: i === 0 ? 0 : 80, 
                  scale: i === 0 ? 1 : 1.02 
                });

                if (i === 0) return;
                const pos = i - 1;

                tl.to(works[i - 1], {
                  autoAlpha: 0,
                  y: -80,
                  scale: 0.98,
                  duration: 1,
                  ease: 'power2.inOut',
                }, pos);

                tl.fromTo(works[i], 
                  { autoAlpha: 0, y: 80, scale: 1.02 },
                  { 
                    autoAlpha: 1, 
                    y: 0, 
                    scale: 1,
                    duration: 1,
                    ease: 'power2.inOut',
                    immediateRender: false
                  }, 
                  pos
                );

                if (progressLabel) {
                  const currentStr = (i + 1).toString().padStart(2, '0');
                  const totalStr = groupWorksCount.toString().padStart(2, '0');
                  tl.add(() => {
                    progressLabel.innerHTML = `${currentStr}&nbsp;/&nbsp;${totalStr}`;
                  }, pos + 0.5);
                }
              });
            }
          });
        });
      }

      // 2. Events Blocks
      if (!isMobile) {
        const eventBlocks = gsap.utils.toArray<HTMLElement>(`.${styles.eventBlock}`);
        eventBlocks.forEach((block) => {
          const eventCol = block.querySelector(`.${styles.eventCol}`) as HTMLElement;
          ScrollTrigger.create({
            trigger: block,
            start: 'top top',
            end: 'bottom bottom',
            pin: eventCol,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });
        });
      }
    });

    return () => ScrollTrigger.getAll().forEach(st => st.kill());
  }, [artistEntries.length, isMobile]);

  return (
    <div className={`${styles.root} ${isMenuOpen ? styles.menuOpen : ''}`}>
      <div className={styles.grain} />
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <div className={styles.sidebarLogo} onClick={() => handleNavClick('manifesto')}>Lingua Universalis</div>
          
          <div className={styles.sidebarLangRow}>
            {languages.map((l) => (
              <button
                key={l.code}
                className={`${styles.sidebarLangBtnSmall} ${lang === l.code ? styles.sidebarLangBtnActive : ''}`}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            className={styles.sidebarImmersionBtn}
            onClick={toggleMode}
            aria-label="Enter immersive mode"
          >
            {lang === 'ru' ? 'Иммерсия' : lang === 'es' ? 'Inmersión' : 'Immersion'}
          </button>

          <nav className={styles.sidebarNav}>
            {navItems.map((item, i) => (
              <div key={item.id} className={styles.navGroup}>
                <button
                  className={`${styles.sidebarNavLink} ${activeSection === item.id ? styles.sidebarNavLinkActive : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  style={{ '--index': i } as any}
                >
                  <span className={styles.navNumber}>{(i + 1).toString().padStart(2, '0')}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
                {item.children && (
                  <div className={styles.navChildren}>
                    {item.children.map((child, j) => (
                      <button
                        key={child.id}
                        className={`${styles.sidebarNavChild} ${activeSection === child.id ? styles.sidebarNavChildActive : ''}`}
                        onClick={() => handleNavClick(child.id)}
                        style={{ '--index': i + j * 0.1 + 0.5 } as any}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Minimalist Header / Mobile Burger */}
        <header className={styles.header}>
          <div className={styles.logo} onClick={() => handleNavClick('manifesto')}>Lingua Universalis</div>
          
          <div className={styles.headerActions}>
            <div className={styles.langContainer}>
              <button
                className={styles.globeButton}
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                aria-label="Toggle Language"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.sidebarGlobeIcon}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </button>
              
              {isLangDropdownOpen && (
                <div className={styles.langDropdown}>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      className={`${styles.dropdownLangBtn} ${lang === l.code ? styles.dropdownLangBtnActive : ''}`}
                      onClick={() => {
                        setLang(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              className={`${styles.burger} ${isMenuOpen ? styles.burgerActive : ''}`}
              onClick={toggleMenu}
              aria-label="Menu"
            >
              <span />
            </button>
          </div>
        </header>

        {/* Manifesto Section */}
        <section ref={manifestoSectionRef} id="manifesto" className={styles.manifestoSection}>
          <div className={styles.manifestoContent}>
            <button
              className={styles.mainImmersionBtn}
              onClick={toggleMode}
              aria-label="Enter immersive mode"
            >
              {lang === 'ru' ? 'Иммерсия' : lang === 'es' ? 'Inmersión' : 'Immersion'}
            </button>
            <h1 className={styles.manifestoTitle}>{t.cave.title}</h1>
            <p className={styles.manifestoSubtitle}>{t.cave.subtitle}</p>

            <div className={styles.manifestoText}>
              {t.cave.manifesto.map((line, i) => (
                <p key={i} className={styles.manifestoLine}>{line}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Collection - The Stationary Flip Architecture */}
        <section ref={collectionSectionRef} className={styles.collectionSection} id="works">
          <div className={styles.collectionInner}>
            {artistEntries.map(([artistName, mediums]) => {
              const artistData = getArtistData(artistName);
              const mediumEntries = Object.entries(mediums);

              return (
                <div
                  key={artistName}
                  className={styles.artistBlock}
                  data-artist={artistName}
                  id={`artist-${artistName.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {/* Artist Info - Pinned on Left (Desktop) / Top (Mobile) */}
                  <div className={styles.artistCol}>
                    <div className={styles.artistInfo}>
                      {artistData.photo && (
                        <div className={styles.artistPhotoWrapper}>
                          <img
                            src={artistData.photo}
                            alt={artistName}
                            className={styles.artistPhoto}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}
                      <div className={styles.artistText}>
                        <h2 className={styles.artistName}>{artistData.name}</h2>
                        <p className={styles.artistBio}>{artistData.bio}</p>
                      </div>
                    </div>
                  </div>

                  {/* Works Column - Stacks works for the Flip Effect */}
                  <div className={styles.worksCol}>
                    {mediumEntries.map(([medium, works]) => (
                      <div key={medium} className={styles.mediumGroup}>
                        <div className={styles.mediumHeader}>
                          <h3 className={styles.mediumTitle}>{getTranslatedMedium(medium)}</h3>
                          <div className={styles.scrollProgress}>
                            <div className={styles.progressLabel}>
                              01&nbsp;/&nbsp;{works.length.toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                        
                        <div className={styles.worksStack}>
                          {works.map((work, idx) => (
                            <figure key={work.id} className={styles.workItem} style={{ zIndex: works.length - idx }}>
                              <div className={styles.workImageWrapper}>
                                <img
                                  src={work.src}
                                  alt={lang === 'ru' ? work.titleRu : work.titleEn}
                                  className={styles.workImage}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                              <figcaption className={styles.workCaption}>
                                <div className={styles.captionHeader}>
                                  <div className={styles.captionTitleArea}>
                                    <span className={styles.workMediumTag}>{getTranslatedMedium(work.medium || 'Other')}</span>
                                    <h4 className={styles.workTitle}>
                                      {lang === 'ru' ? work.titleRu : work.titleEn}
                                    </h4>
                                  </div>
                                  <span className={styles.workIndex}>{(idx + 1).toString().padStart(2, '0')}</span>
                                </div>
                                <div className={styles.workMeta}>
                                  {work.year && <span className={styles.workMetaItem}>{work.year}</span>}
                                  {work.size && <span className={styles.workMetaItem}>{work.size}</span>}
                                </div>
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Events Section */}
        <section ref={eventsSectionRef} id="events" className={styles.eventsSection}>
          {events.map((event) => (
            <div key={event.id} className={styles.eventBlock} id={event.id}>
              {/* Left: Text & Links */}
              <div className={styles.eventCol}>
                <div className={styles.eventInfo}>
                  <span className={styles.eventCategory}>{t.header.events}</span>
                  <h2 className={styles.eventTitle}>
                    {lang === 'ru' ? event.titleRu : event.titleEn}
                  </h2>
                  <div className={styles.eventMeta}>
                    <span>{lang === 'ru' ? event.dateRu : event.dateEn}</span>
                    <span>{lang === 'ru' ? event.locationRu : event.locationEn}</span>
                  </div>
                  <div className={styles.eventStory}>
                    <p>{lang === 'ru' ? event.fullStoryRu : event.fullStoryEn}</p>
                  </div>
                  
                  {event.links && event.links.length > 0 && (
                    <div className={styles.linksSection}>
                      <h4 className={styles.linksTitle}>{lang === 'ru' ? 'Источники' : 'Sources'}</h4>
                      <nav className={styles.blueLinksList}>
                        {event.links.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.blueLink}
                          >
                            {lang === 'ru' ? link.titleRu : link.titleEn}
                          </a>
                        ))}
                      </nav>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Scrolling Images */}
              <div className={styles.eventImagesCol}>
                {event.images.map((img, idx) => (
                  <figure key={idx} className={styles.eventImageFigure}>
                    <img 
                      src={img} 
                      alt="" 
                      className={styles.eventImageLarge} 
                      loading="lazy" 
                    />
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Movie Section */}
        <section id="movie" className={styles.movieSection}>
          <span className={styles.movieLabel}>{t.header.movie}</span>
          <h2 className={styles.movieTitle}>Lingua Universalis</h2>
          <div className={styles.videoWrapper}>
            <iframe 
              src="https://rutube.ru/play/embed/250e0fe59efd7f8bc6026577e8331b58/" 
              className={styles.videoFrame}
              allow="clipboard-write; autoplay" 
              allowFullScreen
              title="Lingua Universalis Movie"
            />
          </div>
        </section>

        {/* Contact */}
        <div className={styles.contactWrapper} id="contact">
          <Contact />
        </div>
      </main>
    </div>
  );
}
