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
  const [activeArtifact, setActiveArtifact] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let handleGlobalClick: () => void;

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
          y: '10vh',
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      // Transition Section: Place nature image at the bottom of the cave
      // Remove previous JS-injected div if it exists to avoid duplicates on fast reload
      const existing = root.querySelector(`.${styles.natureBottom}`);
      if (existing) existing.remove();

      const naturePlaceholder = document.createElement('div');
      naturePlaceholder.className = styles.natureBottom;
      root.appendChild(naturePlaceholder);

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
        // Main container fade and entry
        const anim = gsap.fromTo(
          item,
          { 
            opacity: 0, 
            y: 50,
            filter: 'blur(10px)'
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'top 30%',
              scrub: 0.5,
            },
          }
        );

        // Click to fully reveal
        item.addEventListener('click', () => {
          if (anim.scrollTrigger) {
            anim.scrollTrigger.kill();
          }
          gsap.to(item, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power2.out'
          });
        });

        // Individual text reveal
        const text = item.querySelector(`.${styles.manifestoText}`);
        if (text) {
          const textAnim = gsap.fromTo(text,
            { x: item.classList.contains(styles.manifestoItemOdd) ? -20 : 20 },
            {
              x: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'top 20%',
                scrub: 0.5,
              }
            }
          );

          item.addEventListener('click', () => {
            if (textAnim.scrollTrigger) textAnim.scrollTrigger.kill();
            gsap.to(text, { x: 0, duration: 0.8, ease: 'power2.out' });
          });
        }

        // Parallax for numbers
        const num = item.querySelector(`.${styles.manifestoNumber}`);
        if (num) {
          gsap.fromTo(num, 
            { y: 40 },
            {
              y: -100,
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
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
              start: 'top bottom+=20%',
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

      // Close active artifact on click outside
      handleGlobalClick = () => setActiveArtifact(null);
      window.addEventListener('click', handleGlobalClick);

      // Static Title Mask (Pure CSS handled)
      root.style.setProperty('--title-y', `30vh`);
    }, root);

    return () => {
      ctx.revert();
      if (handleGlobalClick) {
        window.removeEventListener('click', handleGlobalClick);
      }
    };
  }, []);

  const navigate = (newMode: 'immersive' | 'gallery') => {
    // scale transition starting from white inside the breach
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
    { top: 0, left: 55, mobileLeft: 20, id: 1 },
    { top: 25, left: 10, mobileLeft: 5, id: 2 },
    { top: 50, left: 50, mobileLeft: 20, id: 3 },
    { top: 75, left: 15, mobileLeft: 5, id: 4 },
  ];

  return (
    <section id="cave" ref={rootRef} className={styles.root}>
      <div className={styles.bgWrapper}>
        <div className={styles.bg} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
      </div>
      <div className={styles.shadowMask} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.introStack}>
          <div 
            className={styles.archiveBreach}
            onClick={handleArchiveClick}
            role="button"
            tabIndex={0}
            aria-label="Enter Archive"
          >
            <div className={styles.breachVisual}>
              <img 
                src="/assets/images/backgrounds/archiveEntrance3.webp" 
                alt="" 
                className={styles.breachImg} 
              />
            </div>
            <div className={styles.breachContent}>
              <span className={styles.breachLabel}>
                {t.cave.breachLabel.split('\n').map((line, idx) => (
                  <span key={idx} className={styles.breachLine}>{line}</span>
                ))}
              </span>
              <p className={styles.breachDesc}>
                {t.cave.breachDesc.split('\n').map((line, idx) => (
                  <span key={idx} className={styles.breachDescLine}>{line}</span>
                ))}
              </p>
            </div>
          </div>

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
        </div>

        <div className={styles.manifestoGridWrapper}>
          <div className={styles.manifestoGrid}>
            {t.cave.manifesto.map((line, i) => (
              <div 
                key={i} 
                className={`${styles.manifestoItem} ${i % 2 === 0 ? styles.manifestoItemOdd : styles.manifestoItemEven}`}
                style={{ '--index': i } as React.CSSProperties}
              >
                <span className={styles.manifestoNumber}>{i + 1}</span>
                <p className={styles.manifestoText}>
                  {line.split('\n').map((segment, idx) => (
                    <span key={idx} className={styles.manifestoLine}>
                      {segment}
                      {idx < line.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
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
          {artifactsData.map((art, i) => {
            const artInfo = t.cave.artifacts[i];
            return (
              <div
                key={i}
                className={`${styles.artifact} ${activeArtifact === i ? styles.artifactActive : ''}`}
                style={{ 
                  '--top': `${art.top}%`, 
                  '--left': `${art.left}%`,
                  '--mobile-left': `${art.mobileLeft}%`
                } as React.CSSProperties}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveArtifact(activeArtifact === i ? null : i);
                }}
              >
                <div className={styles.artifactImgWrapper}>
                  <img
                    className={`${styles.artifactImg} featherRect`}
                    src={`/assets/art/art-${art.id}.jpg`}
                    alt={artInfo.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={styles.artifactCap}>
                  <h3 className={styles.artifactTitle}>{artInfo.title}</h3>
                  <p className={styles.artifactLocation}>{artInfo.location}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
