import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/useI18n';
import styles from './Cave.module.css';
import { gsap, ScrollTrigger } from '../animation/gsap';

export function Cave() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Toggle active state for cave background activation
      ScrollTrigger.create({
        trigger: root,
        start: 'top 80%',
        end: 'bottom 100%', // Deactivate as soon as we reach the end of the section
        onToggle: (self) => {
          if (self.isActive) {
            root.dataset.caveActive = '1';
          } else {
            delete root.dataset.caveActive;
          }
        },
      });

      // Flashlight Shadow Mask - Always visible in the section until the very end
      gsap.set(`.${styles.shadowMask}`, { opacity: 1 });

      // Ultra Slow Background Parallax - Move it slower than the content
      gsap.fromTo(
        `.${styles.bg}`,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      // Hero Title Animation: Individual characters
      const titleChars = gsap.utils.toArray<HTMLElement>(`.${styles.titleChar}`);
      gsap.fromTo(
        titleChars,
        { 
          opacity: 0, 
          y: 40, 
          filter: 'blur(15px)',
          rotationX: -45 
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          rotationX: 0,
          duration: 2.5,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: `.${styles.hero}`,
            start: 'top 85%',
          },
        }
      );

      // Manifesto Discovery Animation
      const manifestoItems = gsap.utils.toArray<HTMLElement>(`.${styles.manifestoItem}`);
      manifestoItems.forEach((item) => {
        gsap.fromTo(
          item,
          { 
            opacity: 0, 
            y: 80,
            scale: 0.98,
            filter: 'blur(10px)'
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 95%',
              end: 'top 50%',
              scrub: 1,
            },
          }
        );

        const num = item.querySelector(`.${styles.manifestoNumber}`);
        if (num) {
          gsap.to(num, {
            y: -150,
            opacity: 0.3, // Increased visibility
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      });

      // Artifacts Floating Parallax
      const artifacts = gsap.utils.toArray<HTMLElement>(`.${styles.artifact}`);
      artifacts.forEach((art, i) => {
        const speed = 80 + (i % 3) * 50;
        gsap.fromTo(
          art,
          { opacity: 0, y: 150 },
          {
            opacity: 1,
            y: -speed,
            duration: 2,
            scrollTrigger: {
              trigger: art,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      });

      // Transition out: Fade flashlight away as we reach the artifacts section
      // Should be completely gone by the time we reach the last artifact
      const lastArtifact = artifacts[artifacts.length - 1];
      if (lastArtifact) {
        gsap.to(`.${styles.shadowMask}`, {
          opacity: 0,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: lastArtifact,
            start: 'top bottom', // Start fading when the last artifact enters
            end: 'top 30%',      // Completely gone when it reaches upper part of screen
            scrub: true,
          },
        });
      }

    }, root);

    return () => ctx.revert();
  }, []);

  const artifactsData = [
    { top: 5, left: 10, id: 1, title: 'PALEOLITHIC ECHO', sub: 'ALTAMIRA SERIES • 2024' },
    { top: 18, left: 55, id: 2, title: 'THE FIRST SYMBOL', sub: 'VOID FRAGMENT • 2024' },
    { top: 32, left: 15, id: 3, title: 'ANCIENT FREQUENCY', sub: 'RESONANCE • 2024' },
    { top: 48, left: 60, id: 4, title: 'ETERNAL HANDPRINT', sub: 'ORIGIN • 2024' },
  ];

  return (
    <section id="cave" ref={rootRef} className={styles.root}>
      <div className={styles.bgWrapper}>
        <div className={styles.bg} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
      </div>
      <div className={styles.shadowMask} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.manifestoWrapper} id="manifesto">
          <header className={styles.hero}>
            <h1 className={styles.title}>
              {t.cave.title.split(' ').map((word, wordIdx) => (
                <span key={wordIdx} className={styles.titleWord}>
                  {word.split('').map((char, charIdx) => (
                    <span key={charIdx} className={styles.titleChar}>
                      {char}
                    </span>
                  ))}
                  {wordIdx < t.cave.title.split(' ').length - 1 && '\u00A0'}
                </span>
              ))}
            </h1>
            <p className={styles.subtitle}>{t.cave.subtitle}</p>
            <div className={styles.scrollHint}>{t.cave.flashlightHint2}</div>
          </header>

          <div className={styles.manifestoGrid}>
            {t.cave.manifesto.map((line, i) => (
              <div 
                key={i} 
                className={styles.manifestoItem}
                style={{ '--index': i } as React.CSSProperties}
              >
                <span className={styles.manifestoNumber}>{i + 1}</span>
                <p className={styles.manifestoText}>{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          id="ancient"
          className={styles.artifactField}
          aria-label="Ancient cave artifacts"
        >
          {artifactsData.map((art, i) => (
            <div
              key={i}
              className={styles.artifact}
              style={{ top: `${art.top}%`, left: `${art.left}%` } as React.CSSProperties}
            >
              <div className={styles.artifactImgWrapper}>
                <img
                  className={`${styles.artifactImg} featherRect`}
                  src={`/assets/art/art-${art.id}.jpg`}
                  alt={art.title}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={styles.artifactCap}>
                <h3 className={styles.artifactTitle}>{art.title}</h3>
                <p className={styles.artifactSub}>{art.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
