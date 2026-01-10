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
        const any = entries.some((e) => e.isIntersecting);
        if (any) root.dataset.caveActive = '1';
        else delete root.dataset.caveActive;
      },
      { root: null, threshold: [0, 0.05, 0.15], rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(root);

    const ctx = gsap.context(() => {
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
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{t.cave.title}</h1>
          <p className={styles.subtitle}>{t.cave.subtitle}</p>

          <div id="manifesto" />
          <div className={styles.manifestoTitle}>{t.cave.manifestoTitle}</div>
          <ol className={styles.manifestoList}>
            {t.cave.manifesto.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
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
