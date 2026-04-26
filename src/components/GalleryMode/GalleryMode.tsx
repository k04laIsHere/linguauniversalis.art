import { Lang } from '../../i18n/types';
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
  const { toggleMode, mode } = useViewMode();
  const collectionSectionRef = useRef<HTMLElement | null>(null);
  const eventsSectionRef = useRef<HTMLElement | null>(null);
  const manifestoSectionRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isDeclarationOpen, setIsDeclarationOpen] = useState(false);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (isDeclarationOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isDeclarationOpen]);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const languages: { code: Lang; label: string }[] = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ];

  // Dynamically group works by artist based on the current galleryWorks order
  const artistEntries = useMemo(() => {
    if (!galleryWorks) return [];
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
      children: artistEntries.map(([name]) => {
        const member = teamMembers.find(m => m.name === name);
        return {
          id: `artist-${name.replace(/\s+/g, '-').toLowerCase()}`,
          label: lang === 'ru' ? member?.nameRu : lang === 'es' ? member?.nameEs : name
        };
      })
    },
    { 
      id: 'events', 
      label: t.header.events,
      children: events.map(e => ({
        id: e.id,
        label: lang === 'ru' ? e.titleRu : lang === 'es' ? e.titleEs : e.titleEn
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
  const mediumTranslations: Record<string, Record<string, string>> = {
    'Digital Art': { en: 'Digital Art', ru: 'Цифровое искусство', es: 'Arte Digital' },
    'Oil': { en: 'Oil', ru: 'Масло', es: 'Óleo' },
    'Sculpture': { en: 'Sculpture', ru: 'Скульптура', es: 'Escultura' },
    'Acrylic': { en: 'Acrylic', ru: 'Акрил', es: 'Acrílico' },
    'Mixed Media': { en: 'Mixed Media', ru: 'Смешанная техника', es: 'Técnica Mixta' },
    'Other': { en: 'Other', ru: 'Прочее', es: 'Otro' }
  };

  const getTranslatedMedium = (medium: string, work?: any) => {
    if (work) {
      if (lang === 'ru') return work.mediumRu || work.mediumEn || medium;
      if (lang === 'es') return work.mediumEs || work.mediumEn || medium;
      return work.mediumEn || medium;
    }
    return mediumTranslations[medium]?.[lang] || medium;
  };

  // Get team member by name for bio and photo
  const getArtistData = (artistName: string) => {
    const member = teamMembers.find(m => m.name === artistName);
    const translatedName = lang === 'ru' ? member?.nameRu : lang === 'es' ? member?.nameEs : member?.name;

    return {
      name: translatedName || artistName,
      bio: lang === 'ru' ? member?.blurbRu : lang === 'es' ? member?.blurbEs : member?.blurbEn,
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

  const toggleModeWithTransition = () => {
    // Add a black fade overlay before toggling
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'black';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.6s ease';
    overlay.style.pointerEvents = 'none';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    setTimeout(() => {
      toggleMode();
      // The new mode will mount and we should fade out the overlay
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 600);
      }, 300);
    }, 600);
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.background = 'rgba(0, 0, 0, 0.4)'; // Changed to dark ripple
    ripple.className = styles.ripple;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const handlePortalClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleRipple(e);
    toggleModeWithTransition();
  };

  if (mode === 'immersive') return null;

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
            className={styles.sidebarJourneyBtn}
            onClick={toggleModeWithTransition}
            aria-label="Start the Journey"
          >
            {lang === 'ru' ? 'Начать Путешествие' : lang === 'es' ? 'Comenzar el Viaje' : 'Start the Journey'}
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
                {item.id === 'manifesto' && (
                  <div className={styles.navChildren} style={{ marginBottom: '0.5rem' }}>
                    <button
                      className={`${styles.sidebarNavChild} ${isDeclarationOpen ? styles.sidebarNavChildActive : ''}`}
                      onClick={() => {
                        setIsDeclarationOpen(true);
                        setIsMenuOpen(false);
                      }}
                      style={{ '--index': i + 0.1 } as any}
                    >
                      {t.declaration.title}
                    </button>
                  </div>
                )}
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
            <div className={styles.titleGroup}>
              <h1 className={styles.manifestoTitle}>{t.cave.title}</h1>
              <div className={styles.brandSubtitle}>
                {lang === 'ru' ? 'ИСКУССТВО ТВОРЕНИЯ' : lang === 'es' ? 'EL ARTE DE LA CREACIÓN' : 'THE ART OF CREATION'}
              </div>
            </div>
            
            <div className={styles.portalFrame}>
              <p className={styles.philosophicalIntro}>{t.gallery.intro}</p>

              <button
                className={styles.portalBtn}
                onClick={handlePortalClick}
                aria-label="Enter immersive mode"
              >
                <span className={styles.portalLabel}>{t.gallery.portalLabel}</span>
                <svg className={styles.portalArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            <div className={styles.manifestoText}>
              {t.cave.manifesto.map((line, i) => (
                <p key={i} className={styles.manifestoLine}>
                  {line.split('\n').map((segment, idx) => (
                    <span key={idx}>
                      {segment}
                      {idx < line.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              ))}
            </div>

            <button 
              className={styles.declarationBtn}
              onClick={() => setIsDeclarationOpen(true)}
            >
              <span className={styles.declarationBtnLine}></span>
              <span className={styles.declarationBtnText}>{t.declaration.title}</span>
            </button>
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
                          {works.map((work: any, idx) => (
                            <figure key={work.id} className={styles.workItem} style={{ zIndex: works.length - idx }}>
                              <div className={styles.workImageWrapper}>
                                <img
                                  src={work.src}
                                  alt={lang === 'ru' ? work.titleRu : lang === 'es' ? work.titleEs : work.titleEn}
                                  className={styles.workImage}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                              <figcaption className={styles.workCaption}>
                                <div className={styles.captionHeader}>
                                  <div className={styles.captionTitleArea}>
                                    <span className={styles.workMediumTag}>{getTranslatedMedium(work.mediumEn || 'Other', work)}</span>
                                    <h4 className={styles.workTitle}>
                                      {lang === 'ru' ? work.titleRu : lang === 'es' ? work.titleEs : work.titleEn}
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
                    {lang === 'ru' ? event.titleRu : lang === 'es' ? event.titleEs : event.titleEn}
                  </h2>
                  <div className={styles.eventMeta}>
                    <span>{lang === 'ru' ? event.dateRu : lang === 'es' ? event.dateEs : event.dateEn}</span>
                    <span>{lang === 'ru' ? event.locationRu : lang === 'es' ? event.locationEs : event.locationEn}</span>
                  </div>
                  <div className={styles.eventStory}>
                    <p>{lang === 'ru' ? event.fullStoryRu : lang === 'es' ? event.fullStoryEs : event.fullStoryEn}</p>
                  </div>
                  
                  {event.links && event.links.length > 0 && (
                    <div className={styles.linksSection}>
                      <h4 className={styles.linksTitle}>{lang === 'ru' ? 'Источники' : lang === 'es' ? 'Fuentes' : 'Sources'}</h4>
                      <nav className={styles.blueLinksList}>
                        {event.links.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.blueLink}
                          >
                            {lang === 'ru' ? link.titleRu : lang === 'es' ? link.titleEs : link.titleEn}
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

      {/* Declaration Modal */}
      {isDeclarationOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDeclarationOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {t.declaration.title}
              </h2>
              <button 
                className={styles.modalClose} 
                onClick={() => setIsDeclarationOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </header>
            <div className={styles.modalBody}>
              <div className={styles.declarationText}>
                <h3>{t.declaration.projectTitle}</h3>
                <p>{t.declaration.projectDescription}</p>
                <p><strong>{t.declaration.goalTitle}</strong> {t.declaration.goalDescription}</p>
                <p>{t.declaration.fragmentationDescription}</p>
                <p>{t.declaration.artistsTitle}: {t.declaration.artistsDescription}</p>
                <p>{t.declaration.visitDescription}</p>
                <p>{t.declaration.messageDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
