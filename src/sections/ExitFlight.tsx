import { useEffect, useMemo, useRef } from 'react';
import { gsap, initGsap } from '../animation/gsap';
import { useI18n } from '../i18n/useI18n';
import styles from './ExitFlight.module.css';

export function ExitFlight() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const exitFillRef = useRef<HTMLDivElement | null>(null);
  const caveEdgesRef = useRef<HTMLDivElement | null>(null);
  const lightMaskRef = useRef<HTMLDivElement | null>(null);
  const baseDarkRef = useRef<HTMLDivElement | null>(null);
  const edgesContainerRef = useRef<HTMLDivElement | null>(null);

  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
    [],
  );

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const pin = pinRef.current;
    const exitFill = exitFillRef.current;
    const caveEdges = caveEdgesRef.current;
    const lightMask = lightMaskRef.current;
    const baseDark = baseDarkRef.current;
    const edgesContainer = edgesContainerRef.current;
    if (!root || !pin || !exitFill || !caveEdges || !lightMask || !baseDark || !edgesContainer) return;

    initGsap();

    const ctx = gsap.context(() => {
      // transformOrigin 50% 55% looks good for "stepping through" the arch hole
      gsap.set([exitFill, caveEdges, baseDark, edgesContainer], { transformOrigin: '50% 55%' });
      gsap.set(exitFill, { opacity: 1 });
      gsap.set(baseDark, { opacity: 0, scale: 1 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=250%',
          scrub: true,
          pin: root,
          pinSpacing: true,
        },
      });

      // Unified background handling: we no longer have a local valleyDistance layer here.
      // Instead, we rely on the global NatureBackdrop showing through the transparent hole.
      
      // We animate exitFill (foliage) and edgesContainer (cave) in distinct stages to avoid jumps.
      
      // Stage 1: Approach the exit.
      tl.to(exitFill, { scale: 1.6, duration: 0.5 }, 0);
      tl.to(edgesContainer, { scale: 2.2, y: 15, duration: 0.5 }, 0);
      
      // Stage 2: Pass through the exit (foliage and cave edges fly past camera).
      // We close the gaps between tweens to ensure perfectly smooth, non-"chunky" scaling.
      tl.to(exitFill, { scale: 4.5, y: 420, opacity: 0, duration: 0.5 }, 0.5);
      tl.to(edgesContainer, { scale: 4.0, opacity: 0, duration: 0.5 }, 0.5);
      tl.to(lightMask, { opacity: 0, duration: 0.5 }, 0.5);
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="exitFlight" ref={rootRef} className={styles.root} aria-label="Exit flight">
      <div ref={pinRef} className={styles.pin}>
        <div
          ref={exitFillRef}
          className={`${styles.layer} ${styles.exitFill}`}
          aria-hidden="true"
        />
        <div ref={baseDarkRef} className={styles.baseDark} aria-hidden="true" />

        <div ref={edgesContainerRef} className={`${styles.layer} ${styles.edgesContainer}`}>
          <div
            ref={caveEdgesRef}
            className={styles.caveEdges}
            aria-hidden="true"
          />
          {/* Flashlight that affects only the cave edges */}
          <div ref={lightMaskRef} className={styles.edgesLightMask} aria-hidden="true" />
        </div>

        <div className={styles.ui}>
          <div>
            <p className={styles.title}>{t.exitFlight.title}</p>
            <p className={styles.hint}>{t.exitFlight.hint}</p>
          </div>
          <div className={styles.chip}>Scroll</div>
        </div>
      </div>
    </section>
  );
}


