import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/useI18n';
import { useViewMode } from '../contexts/ViewModeContext';
import styles from './Cave.module.css';
import { gsap, ScrollTrigger } from '../animation/gsap';

export function Cave() {
  const { t } = useI18n();
  const { mode, setMode } = useViewMode();
  const rootRef = useRef<HTMLElement | null>(null);
  const manifestEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Toggle active state for cave background activation
      ScrollTrigger.create({
        trigger: root,
        start: 'top 80%',
        end: 'bottom+=50% top',
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

      // Ultra Slow Background Parallax
      gsap.fromTo(
        `.${styles.bg}`,
        { y: 0 },
        {
          y: window.innerHeight * 0.2,
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
            y: -80,
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

      // Transition out: Fade flashlight away
      const lastArtifact = artifacts[artifacts.length - 1];
      if (lastArtifact) {
        gsap.to(`.${styles.shadowMask}`, {
          opacity: 0,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: lastArtifact,
            start: 'top 80%',
            end: 'bottom 50%',
            scrub: true,
          },
        });
      }

      // Archive Breach parallax and appearance
      gsap.fromTo(
        `.${styles.archiveBreach}`,
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 20%',
          },
        }
      );

    }, root);

    return () => ctx.revert();
  }, [mode]);

  const navigate = (newMode: 'immersive' | 'gallery') => {
    // iris-like transition starting from white inside the breach
    const iris = document.createElement('div');
    iris.style.position = 'fixed';
    iris.style.top = '0';
    iris.style.left = '0';
    iris.style.width = '100vw';
    iris.style.height = '100vh';
    iris.style.zIndex = '999999';
    iris.style.background = '#fcfcf9';
    
    // Starting position: center of the breach
    const rect = document.querySelector(`.${styles.archiveBreach}`)?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    
    iris.style.clipPath = `circle(0% at ${cx}px ${cy}px)`;
    document.body.appendChild(iris);

    gsap.to(iris, {
      clipPath: `circle(150% at ${cx}px ${cy}px)`,
      duration: 1.2,
      ease: 'expo.inOut',
      onComplete: () => {
        setMode(newMode);
        window.scrollTo({ top: 0, behavior: 'instant' });
        gsap.to(iris, {
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
          onComplete: () => iris.remove()
        });
      }
    });
  };

  const handleArchiveClick = () => {
    navigate('gallery');
  };

  const artifactsData = [
    { top: 0, left: 55, id: 1, title: 'PALEOLITHIC ECHO', sub: 'ALTAMIRA SERIES • 2024' },
    { top: 25, left: 10, id: 2, title: 'THE FIRST SYMBOL', sub: 'VOID FRAGMENT • 2024' },
    { top: 50, left: 60, id: 3, title: 'ANCIENT FREQUENCY', sub: 'RESONANCE • 2024' },
    { top: 75, left: 15, id: 4, title: 'ETERNAL HANDPRINT', sub: 'ORIGIN • 2024' },
  ];

  return (
    <section id="cave" ref={rootRef} className={styles.root}>
      <div className={styles.bgWrapper}>
        <div className={styles.bg} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
      </div>
      <div className={styles.shadowMask} aria-hidden="true" />

      <div className={styles.inner}>
        <div 
          className={styles.archiveBreach}
          onClick={handleArchiveClick}
          role="button"
          tabIndex={0}
          aria-label="Enter Archive"
        >
          <div className={styles.breachVisual}>
            <img 
              src="/assets/images/backgrounds/archive-breach.webp" 
              alt="" 
              className={styles.breachImg} 
            />
          </div>
          <div className={styles.breachContent}>
            <span className={styles.breachLabel}>Archive</span>
            <p className={styles.breachDesc}>
              Direct access to the results.<br />
              View the portfolio and curated artifacts
            </p>
          </div>
        </div>

        <div className={styles.manifestoWrapper} id="manifesto">
          <header className={styles.hero}>

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

        <div ref={manifestEndRef} className={styles.manifestoEnd} aria-hidden="true" />

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
