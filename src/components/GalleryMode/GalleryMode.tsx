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
      // Manifesto section animations
      const manifestoTitle = manifestoSection.querySelector(`.${styles.manifestoTitle}`);
      const manifestoLines = gsap.utils.toArray<HTMLElement>(
        manifestoSection.querySelectorAll(`.${styles.manifestoLine}`)
      );

      // Animate manifesto title on scroll
      gsap.fromTo(manifestoTitle,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: manifestoSection,
            start: 'top 80%',
          }
        }
      );

      // Animate manifesto lines with stagger
      gsap.fromTo(manifestoLines,
        {
          opacity: 0,
          y: 40
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: manifestoSection,
            start: 'top 70%',
          }
        }
      );

      // Fade out manifesto as we scroll into collection
      gsap.to(manifestoSection, {
        opacity: 0,
        duration: 1,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: collectionSection,
          start: 'top 60%',
          end: 'top 20%',
          scrub: true
        }
      });

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

          // Animate works appearing as we scroll through
          works.forEach((work, i) => {
            const progressStart = i / works.length;
            const progressEnd = (i + 1) / works.length;

            // Fade in work as it comes into view
            gsap.fromTo(work,
              {
                opacity: 0,
                y: 80,
                scale: 0.95
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: work,
                  start: 'top bottom-=100',
                  end: 'top center',
                  scrub: 0.5,
                }
              }

          });
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

      // Mobile: Animate works as they enter viewport and pin artist name
      if (isMobile) {
        const artistBlocks = gsap.utils.toArray<HTMLElement>(`.${styles.artistBlock}`);

        artistBlocks.forEach((block) => {
          const worksCol = block.querySelector(`.${styles.worksCol}`) as HTMLElement;
          const works = gsap.utils.toArray<HTMLElement>(worksCol.querySelectorAll(`.${styles.workItem}`));
          const mobileHeader = block.querySelector(`.${styles.mobileArtistHeader}`) as HTMLElement;

          if (!works.length || !mobileHeader) return;

          // Calculate scroll distance for mobile
          const scrollDistance = works.length * (window.innerHeight * 0.6);

          // Pin mobile artist header while scrolling through works
          ScrollTrigger.create({
            trigger: block,
            start: 'top 0',
            end: `+=${scrollDistance}`,
            pin: mobileHeader,
            pinSpacing: true,
            scrub: 0.5,
          });

          // Animate works as they enter viewport
          works.forEach((work) => {
            gsap.fromTo(work,
              {
                opacity: 0,
                y: 40,
                scale: 0.95
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: work,
                  start: 'top bottom-=50',
                }
              }
            );
          });
        });
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

                {/* Mobile: Sticky Name Header */}
                <div className={styles.mobileArtistHeader}>
                  <h2 className={styles.mobileArtistName}>{artistName}</h2>
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
                        <h3 className={styles.workTitle}>{lang === 'ru' ? work.titleRu : work.titleEn}</h3>
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
