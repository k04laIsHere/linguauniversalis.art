import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/useI18n';
import { useViewMode } from '../contexts/ViewModeContext';
import styles from './Cave.module.css';
import { gsap, ScrollTrigger } from '../animation/gsap';

export function Cave() {
  const { t } = useI18n();
  const { setMode } = useViewMode();
  const rootRef = useRef<HTMLElement | null>(null);
  const manifestEndRef = useRef<HTMLDivElement | null>(null);
  const breachContentRef = useRef<HTMLDivElement | null>(null);
  const [breachScale, setBreachScale] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      if (!breachContentRef.current) return;
      
      const content = breachContentRef.current;
      // Get base dimensions. We use 1.6 factor to ensure content is well within the 16/9 breach image.
      const width = content.offsetWidth;
      const height = content.offsetHeight;
      
      if (width === 0 || height === 0) return;

      const paddingFactor = 1.6; 
      const targetWidth = width * paddingFactor;
      const targetHeight = height * paddingFactor;
      
      const breachWidthForHeight = targetHeight * (16/9);
      const neededWidth = Math.max(targetWidth, breachWidthForHeight);
      
      const isMobile = window.innerWidth <= 960;
      // Mobile baseWidth logic needs to be stable relative to the 230% width in CSS
      const baseWidth = isMobile 
        ? window.innerWidth * 2.3 
        : Math.min(Math.max(500, window.innerWidth * 0.5), 1100);
      
      setBreachScale(Math.max(1, neededWidth / baseWidth));
      setIsInitialized(true);
    };

    // Use a small delay to ensure styles and fonts are applied
    const timer = setTimeout(updateScale, 200);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [t.cave.breachLabel, t.cave.breachDesc]);

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
        `.${styles.bgWrapper}`,
        { y: 0 },
        {
          y: () => window.innerHeight * 0.2,
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
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: (i, target) => {
             // Let the dynamic scale from state be the base, but allow GSAP to animate it
             return breachScale;
          },
          y: 0,
          duration: 2.5,
          delay: 1.0,
          ease: 'expo.out',
        }
      );

    }, root);

    return () => ctx.revert();
  }, [breachScale]);

  const navigate = (newMode: 'immersive' | 'gallery') => {
    // scale transition starting from white inside the breach
    const breach = document.querySelector(`.${styles.archiveBreach}`);
    const breachImg = document.querySelector(`.${styles.breachImg}`);
    const breachContent = document.querySelector(`.${styles.breachContent}`);
    
    // Create a white overlay that fades in during the scale
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '999998';
    overlay.style.background = '#fcfcf9';
    overlay.style.opacity = '0';
    document.body.appendChild(overlay);

    const tl = gsap.timeline({
      onComplete: () => {
        setMode(newMode);
        window.scrollTo({ top: 0, behavior: 'instant' });
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
          onComplete: () => overlay.remove()
        });
      }
    });

    // Fade out text immediately
    if (breachContent) {
      tl.to(breachContent, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      }, 0);
    }

    // Scale up the breach image
    if (breachImg) {
      tl.to(breachImg, {
        scale: 15,
        duration: 1.5,
        ease: 'expo.in',
      }, 0);
    }

    // Fade in the white overlay to match the inner white of the image
    tl.to(overlay, {
      opacity: 1,
      duration: 1.0,
      ease: 'power2.in'
    }, 0.5);
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
          style={{ 
            '--breach-dynamic-scale': breachScale,
            opacity: isInitialized ? 1 : 0,
            visibility: isInitialized ? 'visible' : 'hidden',
            transition: 'opacity 0.6s ease'
          } as any}
        >
          <div className={styles.breachVisual}>
            <img 
              src="/assets/images/backgrounds/archiveEntrance3.webp" 
              alt="" 
              className={styles.breachImg} 
            />
          </div>
          <div className={styles.breachContent} ref={breachContentRef}>
            <span className={styles.breachLabel}>
              {t.cave.breachLabel.split('\n').map((line, idx) => (
                <span key={idx} style={{ display: 'block' }}>{line}</span>
              ))}
            </span>
            <p className={styles.breachDesc}>
              {t.cave.breachDesc.split('\n').map((line, idx) => (
                <span key={idx} style={{ display: 'block' }}>{line}</span>
              ))}
            </p>
          </div>
        </div>

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
