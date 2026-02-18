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

  // Setup scroll orchestration
  useEffect(() => {
    const collectionSection = collectionSectionRef.current;
    const manifestoSection = manifestoSectionRef.current;
    if (!collectionSection || !manifestoSection) return;

    const ctx = gsap.context(() => {
      const artistBlocks = gsap.utils.toArray<HTMLElement>(`.${styles.artistBlock}`);
      
      artistBlocks.forEach((block, index) => {
        const worksCol = block.querySelector(`.${styles.worksCol}`) as HTMLElement;
        const works = gsap.utils.toArray<HTMLElement>(worksCol.querySelectorAll(`.${styles.workItem}`));
        const artistName = block.dataset.artist;
        const artistInfo = block.querySelector(`.${styles.artistInfo}`) as HTMLElement;

        if (!works.length) return;

        // Calculate the scroll distance for this artist's works
        // Give each work ~80vh of scroll space for comfortable viewing
        const scrollDistance = works.length * (window.innerHeight * 0.85);

        // Create pinned scroll for this artist block
        const pinTrigger = ScrollTrigger.create({
          trigger: block,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5, // Smoother scrubbing
          invalidateOnRefresh: true,
          id: `artist-pin-${index}`,
          onEnter: () => {
            // Artist comes into focus
            gsap.to(artistInfo, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out'
            });
          },
          onLeave: () => {
            // Artist fades out as we move to next
            gsap.to(artistInfo, {
              opacity: 0,
              y: -30,
              duration: 0.6,
              ease: 'power3.in'
            });
          },
          onEnterBack: () => {
            // Artist reappears when scrolling back
            gsap.to(artistInfo, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out'
            });
          },
          onLeaveBack: () => {
            // Artist fades out when scrolling to previous
            gsap.to(artistInfo, {
              opacity: 0,
              y: 30,
              duration: 0.6,
              ease: 'power3.in'
            });
          }
        });

        // Animate works appearing as we scroll through the pinned block
        works.forEach((work, i) => {
          const progressStart = i / works.length;
          const progressEnd = (i + 0.8) / works.length; // Slight overlap

          // Work item reveal animation - based on scroll progress within pin
          const workTrigger = ScrollTrigger.create({
            trigger: block,
            start: () => `top+=${progressStart * scrollDistance} top`,
            end: () => `top+=${progressEnd * scrollDistance} top`,
            scrub: 0.5,
            onUpdate: (self) => {
              const progress = self.progress;
              // Fade in and move up
              gsap.set(work, {
                opacity: Math.min(progress * 1.5, 1),
                y: (1 - progress) * 100,
                scale: 0.95 + (progress * 0.05)
              });
            }
          });

          // Work item fade out as we scroll past it
          ScrollTrigger.create({
            trigger: block,
            start: () => `top+=${(progressEnd - 0.15) * scrollDistance} top`,
            end: () => `top+=${progressEnd * scrollDistance} top`,
            scrub: 0.5,
            onUpdate: (self) => {
              const progress = self.progress;
              // Fade out and scale down slightly
              const opacity = 1 - (progress * 0.7);
              gsap.set(work, {
                opacity: Math.max(opacity, 0.3),
                scale: 1 - (progress * 0.1)
              });
            }
          });
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

      {/* Collection - Pinned Artist Scroller */}
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
                {/* Artist Column - Fixed during pin */}
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

                {/* Works Column - Scroll through pinned */}
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
