import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { useViewMode } from '../../contexts/ViewModeContext';
import { teamMembers } from '../../content/teamData';
import { galleryWorks } from '../../content/galleryManifest';
import { Contact } from '../../sections/Contact';
import { gsap, ScrollTrigger } from '../../animation/gsap';
import { scrollToId } from '../../utils/scroll';
import styles from './GalleryMode.module.css';

export function GalleryMode() {
  const { t, lang } = useI18n();
  const { toggleMode } = useViewMode();
  const collectionSectionRef = useRef<HTMLElement | null>(null);
  const manifestoSectionRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Group works by artist
  const worksByArtist = galleryWorks.reduce((acc, work) => {
    if (!acc[work.artist]) {
      acc[work.artist] = [];
    }
    acc[work.artist].push(work);
    return acc;
  }, {} as Record<string, typeof galleryWorks>);

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
    const manifestoSection = manifestoSectionRef.current;
    if (!collectionSection || !manifestoSection) return;

    const ctx = gsap.context(() => {
      // Mobile: Update fixed artist name header as we scroll through artists
      if (isMobile) {
        const artistBlocks = gsap.utils.toArray<HTMLElement>(`.${styles.artistBlock}`);
        const mobileHeaderName = document.querySelector(`.${styles.mobileHeaderName}`) as HTMLElement;
        const mobileHeader = document.querySelector(`.${styles.mobileFixedHeader}`) as HTMLElement;

        if (!artistBlocks.length || !mobileHeaderName) return;

        artistBlocks.forEach((block) => {
          const artistName = block.dataset.artist;

          if (!artistName) return;

          ScrollTrigger.create({
            trigger: block,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => {
              mobileHeaderName.textContent = artistName;
              mobileHeader.style.opacity = '1';
              mobileHeader.style.visibility = 'visible';
            },
            onLeave: () => {
              mobileHeader.style.opacity = '0';
              mobileHeader.style.visibility = 'hidden';
            },
            onEnterBack: () => {
              mobileHeaderName.textContent = artistName;
              mobileHeader.style.opacity = '1';
              mobileHeader.style.visibility = 'visible';
            },
            onLeaveBack: () => {
              mobileHeader.style.opacity = '0';
              mobileHeader.style.visibility = 'hidden';
            }
          });
        });
      }

      // Desktop: Pin artist columns while scrolling through works
      if (!isMobile) {
        const artistBlocks = gsap.utils.toArray<HTMLElement>(`.${styles.artistBlock}`);

        artistBlocks.forEach((block) => {
          const worksCol = block.querySelector(`.${styles.worksCol}`) as HTMLElement;
          const works = gsap.utils.toArray<HTMLElement>(worksCol.querySelectorAll(`.${styles.workItem}`));
          const artistCol = block.querySelector(`.${styles.artistCol}`) as HTMLElement;

          if (!works.length) return;

          // Calculate scroll distance: each work gets 80vh of scroll space
          const scrollDistance = works.length * (window.innerHeight * 0.8);

          // Pin the artist column while scrolling through works
          ScrollTrigger.create({
            trigger: block,
            start: 'top 100px', // Start pinning when block reaches 100px from top
            end: `+=${scrollDistance}`,
            pin: artistCol, // Pin ONLY the artist column
            pinSpacing: true,
            scrub: 1,
            invalidateOnRefresh: true,
          });

          // No animations on works - they appear naturally
        });

        // Scroll up from first artist returns to manifesto
        const firstBlock = document.querySelector(`.${styles.artistBlock}`) as HTMLElement;
        if (firstBlock) {
          ScrollTrigger.create({
            trigger: firstBlock,
            start: 'top top',
            onLeaveBack: () => {
              setTimeout(() => scrollToId('manifesto'), 100);
            }
          });
        }
      }

      // Mobile: No GSAP needed - everything displays naturally
      if (isMobile) {
        // No pinning needed
      }

    }, collectionSection);

    return () => ctx.revert();
  }, [isMobile, artistEntries.length]);

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

      {/* Manifesto Section - Large Serif */}
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

      {/* Collection - Desktop: Pinned artist, Mobile: Sticky name header */}
      <section ref={collectionSectionRef} className={styles.collectionSection}>
        <div className={styles.collectionInner}>
          {artistEntries.map(([artistName, works]) => {
            const artistData = getArtistData(artistName);
            return (
              <div
                key={artistName}
                className={styles.artistBlock}
                data-artist={artistName}
              >
                {/* Desktop: Artist Column */}
                <div className={styles.artistCol}>
                  <div className={styles.artistInfo}>
                    {artistData.photo && (
                      <img
                        src={artistData.photo}
                        alt={artistName}
                        className={styles.artistPhoto}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <h2 className={styles.artistName}>{artistName}</h2>
                    <p className={styles.artistBio}>{artistData.bio}</p>
                  </div>
                </div>

                {/* Works Column */}
                <div className={styles.worksCol}>
                  {works.map((work) => (
                    <figure key={work.id} className={styles.workItem}>
                      <img
                        src={work.src}
                        alt={lang === 'ru' ? work.titleRu : work.titleEn}
                        className={styles.workImage}
                        loading="lazy"
                        decoding="async"
                      />
                      <figcaption className={styles.workCaption}>
                        <h3 className={styles.workTitle}>
                          {lang === 'ru' ? work.titleRu : work.titleEn}
                        </h3>
                        <div className={styles.workMeta}>
                          {work.year && <span className={styles.workMetaItem}>{work.year}</span>}
                          {work.medium && <span className={styles.workMetaItem}>{work.medium}</span>}
                          {work.size && <span className={styles.workMetaItem}>{work.size}</span>}
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact - Use existing component */}
      <Contact />
    </div>
  );
}
