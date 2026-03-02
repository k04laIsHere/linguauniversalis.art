import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { useViewMode } from '../../contexts/ViewModeContext';
import { teamMembers } from '../../content/teamData';
import { galleryWorks } from '../../content/galleryManifest';
import { Contact } from '../../sections/Contact';
import { gsap, ScrollTrigger } from '../../animation/gsap';
import styles from './GalleryMode.module.css';

export function GalleryMode() {
  const { t, lang } = useI18n();
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

  // Get team member by name for bio and photo
  const getArtistData = (artistName: string) => {
    const member = teamMembers.find(m => m.name === artistName);
    return {
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
        
        // 1. Pin the Artist Info Column
        ScrollTrigger.create({
          trigger: block,
          start: 'top top',
          end: 'bottom bottom',
          pin: artistCol,
          pinSpacing: false,
          invalidateOnRefresh: true,
          refreshPriority: -1,
        });

        // 2. Handle Medium Groups and their Flipping Works
        mediumGroups.forEach((group) => {
          const works = gsap.utils.toArray<HTMLElement>(group.querySelectorAll(`.${styles.workItem}`));
          const progressLabel = group.querySelector(`.${styles.progressLabel}`) as HTMLElement;
          const groupWorksCount = works.length;
          
          const groupDistance = (groupWorksCount - 1) * window.innerHeight;

          if (groupWorksCount > 1) {
            let lastIndex = 0;

            ScrollTrigger.create({
              trigger: group,
              start: 'top top',
              end: `+=${groupDistance}`,
              pin: true,
              pinSpacing: true,
              invalidateOnRefresh: true,
              refreshPriority: 1,
              onUpdate: (self) => {
                const currentIndex = Math.round(self.progress * (groupWorksCount - 1));
                if (currentIndex !== lastIndex) {
                  // Hide previous
                  gsap.to(works[lastIndex], { 
                    opacity: 0, 
                    visibility: 'hidden', 
                    duration: 0.3,
                    overwrite: 'auto'
                  });
                  // Show current
                  gsap.to(works[currentIndex], { 
                    opacity: 1, 
                    visibility: 'visible', 
                    duration: 0.3,
                    overwrite: 'auto'
                  });
                  
                  // Update Label with animation
                  if (progressLabel) {
                    const currentStr = (currentIndex + 1).toString().padStart(2, '0');
                    progressLabel.innerText = `${currentStr} / ${groupWorksCount.toString().padStart(2, '0')}`;
                    gsap.fromTo(progressLabel, 
                      { y: 5, opacity: 0 }, 
                      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
                    );
                  }
                  
                  lastIndex = currentIndex;
                }
              },
              onLeaveBack: () => {
                gsap.set(works[0], { opacity: 1, visibility: 'visible' });
                for(let i = 1; i < works.length; i++) {
                  gsap.set(works[i], { opacity: 0, visibility: 'hidden' });
                }
                if (progressLabel) {
                  progressLabel.innerText = `01 / ${groupWorksCount.toString().padStart(2, '0')}`;
                }
                lastIndex = 0;
              }
            });
          }

          // Initial setup
          works.forEach((work, i) => {
            gsap.set(work, { 
              opacity: i === 0 ? 1 : 0,
              visibility: i === 0 ? 'visible' : 'hidden'
            });
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
          Enter Immersion
        </button>
      </header>

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
                      <h2 className={styles.artistName}>{artistName}</h2>
                      <p className={styles.artistBio}>{artistData.bio}</p>
                    </div>
                  </div>
                </div>

                {/* Works Column - Stacks works for the Flip Effect */}
                <div className={styles.worksCol}>
                  {mediumEntries.map(([medium, works]) => (
                    <div key={medium} className={styles.mediumGroup}>
                      <div className={styles.mediumHeader}>
                        <h3 className={styles.mediumTitle}>{medium}</h3>
                        <div className={styles.scrollProgress}>
                          <div className={styles.progressLabel}>01 / {works.length}</div>
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
                                  <span className={styles.workMediumTag}>{work.medium}</span>
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
