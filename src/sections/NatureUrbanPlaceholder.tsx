import { useEffect, useMemo, useRef } from 'react';
import { ScrollTrigger, initGsap, gsap } from '../animation/gsap';
import { useI18n } from '../i18n/useI18n';
import styles from './NatureUrbanPlaceholder.module.css';

export function NatureUrbanPlaceholder() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);
  const noiseRef = useRef<HTMLDivElement | null>(null);

  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
    [],
  );

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const noise = noiseRef.current;
    if (!root || !noise) return;

    initGsap();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      });

      tl.to(noise, { opacity: 0.3, duration: 0.5 }, 0)
        .to(noise, { opacity: 0, duration: 0.5 }, 1.5)
        .fromTo(
          `.${styles.title}`,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          0.5
        )
        .fromTo(
          `.${styles.lede}`,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          0.7
        );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="natureUrban" ref={rootRef} className={styles.root} aria-label="Nature to Urban">
      <div ref={noiseRef} className={styles.noise} aria-hidden="true" />
      <div className={styles.pin}>
        <div className={styles.content}>
          <div className={styles.textBlock}>
            <p className={styles.title}>{t.natureUrban.title}</p>
            <div className={styles.separator} />
            <p className={styles.lede}>{t.natureUrban.lede}</p>
          </div>
          <div className={styles.scrollIndicator}>
            <span className={styles.scrollLine} />
            <span className={styles.scrollText}>Discovery</span>
          </div>
        </div>
      </div>
    </section>
  );
}


