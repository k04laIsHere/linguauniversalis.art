import { useEffect, useRef } from 'react';
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

  // Check if we're on mobile
  const isMobile = () => window.innerWidth <= 768;

  // Setup scroll animations (desktop only)
  useEffect(() => {
    const collectionSection = collectionSectionRef.current;
    const manifestoSection = manifestoSectionRef.current;
    if (!collectionSection || !manifestoSection) return;

    const ctx = gsap.context(() => {
      // Only setup animations on desktop
      if (isMobile()) return;

      const artistBlocks = gsap.utils.toArray<HTMLElement>(`.${styles.artistBlock}`);

      artistBlocks.forEach((block, index) => {
        const worksCol = block.querySelector(`.${styles.worksCol}`) as HTMLElement;
        const works = gsap.utils.toArray<HTMLElement>(worksCol.querySelectorAll(`.${styles.workItem}`));
        const artistInfo = block.querySelector(`.${styles.artistInfo}`) as HTMLElement;

        if (!works.length) return;

        // Animate artist info on enter/leave
        ScrollTrigger.create({
          trigger: block,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => {
            gsap.to(artistInfo, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out'
            });
          },
          onLeave: () => {
            gsap.to(artistInfo, {
              opacity: 0.5,
              duration: 0.6,
              ease: 'power3.in'
            });
          },
          onEnterBack: () => {
            gsap.to(artistInfo, {
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out'
            });
          },
          onLeaveBack: () => {
            gsap.to(artistInfo, {
              opacity: 0.5,
              duration: 0.6,
              ease: 'power3.in'
            });
          }
        });

        // Animate works appearing as they scroll into view
        works.forEach((work) => {
          gsap.fromTo(work,
            {
              opacity: 0,
              y: 60,
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
                scrub: 0.5
              }
            }
          );
        });
      });

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

        {/* Scroll Hint */}
        <div className={styles.scrollHint}>
          <span className={styles.scrollHintText}>Scroll to explore</span>
          <div className={styles.scrollHintIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Collection - Desktop: Sticky artist column, Mobile: Normal scroll */}
      <section ref={collectionSectionRef} className={styles.collectionSection}>
        <div className={styles.collectionInner}>
          {artistEntries.map(([artistName, works], idx) => {
            const artistData = getArtistData(artistName);
            return (
              <div
                key={artistName}
                className={styles.artistBlock}
                data-artist={artistName}
              >
                {/* Artist Column - Sticky on desktop via CSS */}
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

                {/* Works Column - Normal scroll */}
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
