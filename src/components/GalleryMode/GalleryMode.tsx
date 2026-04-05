import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { useViewMode } from '../../contexts/ViewModeContext';
import { teamMembers } from '../../content/teamData';
import { galleryWorks } from '../../content/galleryManifest';
import { Contact } from '../../sections/Contact';
import { gsap, ScrollTrigger } from '../../animation/gsap';
import styles from './GalleryMode.module.css';

export function GalleryMode() {
  const { t, lang, setLang } = useI18n();
  const { toggleMode } = useViewMode();
  const collectionSectionRef = useRef<HTMLElement | null>(null);
  const manifestoSectionRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Group works by artist and then by medium
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

  const artistEntries = Object.entries(worksByArtist);

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
      member?.name === 'Joslen Orsini' ? 'Жослен Орсини' :
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
    const collectionSection = collectionSectionRef.current;
    if (!collectionSection) return;

    const ctx = gsap.context(() => {
      const artistBlocks = gsap.utils.toArray<HTMLElement>(`.${styles.artistBlock}`);

      artistBlocks.forEach((block) => {
        const artistCol = block.querySelector(`.${styles.artistCol}`) as HTMLElement;
        const mediumGroups = gsap.utils.toArray<HTMLElement>(block.querySelectorAll(`.${styles.mediumGroup}`));
        
        // 1. Artist Sidebar/Header pinning (Native CSS handled via .artistCol sticky class)
        // No GSAP pin needed here anymore as we'll use CSS position: sticky

        // 2. Handle Works within each Medium Group
        mediumGroups.forEach((group) => {
          const works = gsap.utils.toArray<HTMLElement>(group.querySelectorAll(`.${styles.workItem}`));
          const progressLabel = group.querySelector(`.${styles.progressLabel}`) as HTMLElement;
          const groupWorksCount = works.length;

          // Instead of pinning the whole group, we animate each work 
          // as it hits the sticky "active" zone at the top of the viewport
          works.forEach((work, i) => {
            const isLast = i === groupWorksCount - 1;
            
            // Initial state for all works
            gsap.set(work, { 
              autoAlpha: i === 0 ? 1 : 0,
              scale: 1,
              y: 0 
            });

            // "Flip" Animation: 
            // Triggered when the NEXT work starts coming up
            if (!isLast) {
              const nextWork = works[i + 1];
              
              ScrollTrigger.create({
                trigger: nextWork,
                start: 'top bottom', // When next work enters screen
                end: 'top top',    // Until next work is fully sticky
                scrub: true,
                onUpdate: (self) => {
                  // Current work fades out and drifts up
                  gsap.set(work, {
                    autoAlpha: 1 - self.progress,
                    y: -100 * self.progress,
                    scale: 1 - (0.05 * self.progress)
                  });
                  
                  // Next work fades in and settles
                  gsap.set(nextWork, {
                    autoAlpha: self.progress,
                    scale: 1.03 - (0.03 * self.progress),
                    y: 60 * (1 - self.progress)
                  });
                  
                  // Update Label at the midpoint
                  if (progressLabel && self.progress > 0.5) {
                    const currentStr = (i + 2).toString().padStart(2, '0');
                    const totalStr = groupWorksCount.toString().padStart(2, '0');
                    progressLabel.innerHTML = `${currentStr}&nbsp;/&nbsp;${totalStr}`;
                  } else if (progressLabel && self.progress <= 0.5) {
                    const currentStr = (i + 1).toString().padStart(2, '0');
                    const totalStr = groupWorksCount.toString().padStart(2, '0');
                    progressLabel.innerHTML = `${currentStr}&nbsp;/&nbsp;${totalStr}`;
                  }
                }
              });
            }
          });
        });
      });
    }, collectionSection);

    return () => ctx.revert();
  }, [artistEntries.length]);

  return (
    <div className={styles.root}>
      {/* Minimalist Header */}
      <header className={styles.header}>
        <div className={styles.logo}>Lingua Universalis</div>
        <button
          className={styles.enterButton}
          onClick={toggleMode}
          aria-label="Enter immersive mode"
        >
          {lang === 'ru' ? 'Войти в Иммерсию' : 'Enter Immersion'}
        </button>
      </header>

      {/* Persistent Language Toggle */}
      <button
        type="button"
        className={styles.langToggleFixed}
        onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
        aria-label="Toggle Language"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.globeIcon}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className={styles.langCode}>{lang.toUpperCase()}</span>
      </button>

      {/* Manifesto Section */}
      <section ref={manifestoSectionRef} id="manifesto" className={styles.manifestoSection}>
        <div className={styles.manifestoContent}>
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
      <section ref={collectionSectionRef} className={styles.collectionSection}>
        <div className={styles.collectionInner}>
          {artistEntries.map(([artistName, mediums]) => {
            const artistData = getArtistData(artistName);
            const mediumEntries = Object.entries(mediums);

            return (
              <div
                key={artistName}
                className={styles.artistBlock}
                data-artist={artistName}
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

      {/* Contact */}
      <div className={styles.contactWrapper}>
        <Contact />
      </div>
    </div>
  );
}
