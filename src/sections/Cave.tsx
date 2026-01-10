import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/useI18n';
import styles from './Cave.module.css';
import { gsap } from '../animation/gsap';

export function Cave() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);
  const artifactsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Use a more strict intersection check: hide cave effects as soon as it's mostly gone
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          root.dataset.caveActive = '1';
        } else {
          delete root.dataset.caveActive;
        }
      },
      { root: null, threshold: [0, 0.1, 0.2], rootMargin: '-10% 0px -20% 0px' },
    );
    io.observe(root);

    const ctx = gsap.context(() => {
      // Background parallax: very subtle scroll
      gsap.fromTo(
        `.${styles.bg}`,
        { y: -15 },
        {
          y: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      );

      // Hero reveal
      gsap.fromTo(
        `.${styles.title}`,
        { opacity: 0, letterSpacing: '0.8em', filter: 'blur(20px)' },
        {
          opacity: 1,
          letterSpacing: '0.35em',
          filter: 'blur(0px)',
          duration: 3,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: `.${styles.hero}`,
            start: 'top 95%',
          },
        }
      );

      gsap.fromTo(
        `.${styles.subtitle}`,
        { opacity: 0, y: 50 },
        {
          opacity: 0.7,
          y: 0,
          duration: 2,
          delay: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: `.${styles.hero}`,
            start: 'top 95%',
          },
        }
      );

      // Manifesto items
      const isMobile = window.innerWidth <= 960;
      const manifestoItems = gsap.utils.toArray<HTMLElement>(`.${styles.manifestoItem}`);

      manifestoItems.forEach((item, i) => {
        const baseRotation = i % 2 === 0 ? -4 : 3;
        const initialY = isMobile ? 0 : (i % 2 === 0 ? 0 : 120);

        // Initial entry animation
        gsap.fromTo(
          item,
          { 
            opacity: 0, 
            x: isMobile ? 0 : (i % 2 === 0 ? -60 : 60),
            y: initialY + 100,
            rotation: baseRotation * 2,
          },
          {
            opacity: 1,
            x: 0,
            y: initialY,
            rotation: baseRotation,
            duration: 2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 100%',
              end: 'bottom 80%',
              scrub: 1.5,
            },
          }
        );

        // Straighten on scroll (Sweet spot in center)
        gsap.to(item, {
          rotation: 0,
          scale: isMobile ? 1.02 : 1.05,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: item,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 0.5,
          },
        });

        // Mouse proximity straightening (Desktop)
        if (!isMobile) {
          const onMouseMove = (e: MouseEvent) => {
            const rect = item.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
            
            const maxDist = 800; /* Heavily enlarged hover area */
            const proximity = Math.max(0, 1 - dist / maxDist);
            
            gsap.to(item, {
              rotation: baseRotation * (1 - proximity),
              scale: 1 + proximity * 0.08,
              duration: 0.15, /* Very fast response */
              overwrite: 'auto'
            });
          };

          const onMouseLeave = () => {
            gsap.to(item, {
              rotation: baseRotation,
              scale: 1,
              duration: 0.4,
              overwrite: 'auto'
            });
          };

          item.addEventListener('mousemove', onMouseMove);
          item.addEventListener('mouseleave', onMouseLeave);
        }
      });

      // Artifact parallax: move them at slightly different speeds
      gsap.utils.toArray<HTMLElement>(`.${styles.artifact}`).forEach((art, i) => {
        const speed = 40 + (i % 3) * 25; 
        gsap.to(art, {
          y: -speed,
          ease: 'none',
          scrollTrigger: {
            trigger: art,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, root);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, []);

  const artifactsData = [
    { top: 15, left: 8, id: 1, size: 'large' },
    { top: 35, left: 62, id: 2, size: 'medium' },
    { top: 58, left: 12, id: 3, size: 'large' },
    { top: 82, left: 68, id: 4, size: 'medium' },
    { top: 110, left: 15, id: 1, size: 'medium' },
    { top: 135, left: 55, id: 2, size: 'large' },
    { top: 165, left: 10, id: 3, size: 'medium' },
    { top: 195, left: 65, id: 4, size: 'large' },
    { top: 225, left: 20, id: 1, size: 'medium' },
    { top: 250, left: 58, id: 2, size: 'large' },
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
            <h1 className={styles.title}>{t.cave.title}</h1>
            <p className={styles.subtitle}>{t.cave.subtitle}</p>
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
          ref={artifactsRef}
          className={styles.artifactField}
          aria-label="Ancient cave artifacts"
        >
          {artifactsData.map((art, i) => {
            const n = art.id;
            const title = 'PALEOLITHIC ECHO';
            const sub = 'ALTAMIRA SERIES • 2024';
            return (
              <div
                key={i}
                className={`${styles.artifact} ${styles[art.size]}`}
                data-artifact="1"
                style={{ top: `${art.top}%`, left: `${art.left}%` }}
              >
                <div className={styles.artifactImgWrapper}>
                  <img
                    className={`${styles.artifactImg} featherRect`}
                    src={`/assets/art/art-${n}.jpg`}
                    alt={`Cave art ${n}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={styles.artifactCap}>
                  <h3 className={styles.artifactTitle}>{title}</h3>
                  <p className={styles.artifactSub}>{sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
