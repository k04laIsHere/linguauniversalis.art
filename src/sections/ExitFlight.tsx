import { useEffect, useMemo, useRef } from 'react';
import { gsap, ScrollTrigger, initGsap } from '../animation/gsap';
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
      const nature = document.getElementById('natureBackdrop');
      const urban = document.getElementById('urbanBackdrop');

      const origin = '50% 55%';
      gsap.set([exitFill, caveEdges, baseDark, edgesContainer], { 
        transformOrigin: origin,
        force3D: false, 
      });

      // 1. Landscape starts EVEN HIGHER and LARGER to fill the hole at the beginning
      gsap.set(exitFill, { opacity: 1, y: -280, scale: 1.45 });
      gsap.set(baseDark, { opacity: 0, scale: 1 });

      // 2. Separate ScrollTrigger for backdrop visibility to avoid jumps in scrubbed timeline
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        onEnter: () => {
          if (nature) gsap.set(nature, { opacity: 1 });
          if (urban) gsap.set(urban, { opacity: 0 });
        },
        onEnterBack: () => {
          if (nature) gsap.set(nature, { opacity: 1 });
          if (urban) gsap.set(urban, { opacity: 0 });
        },
        onLeaveBack: () => {
          if (nature) gsap.to(nature, { opacity: 0, duration: 0.5 });
        },
        refreshPriority: 5,
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=250%',
          scrub: true,
          pin: root,
          pinSpacing: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          pinType: 'fixed',
          refreshPriority: 10,
          // Ensure we don't have jumps when entering/leaving
          invalidateOnRefresh: true,
        },
      });

      // Anchoring the starting state of the transition to prevent jumps
      if (nature) {
        tl.set(nature, { scale: 1.02, y: 0, opacity: 1 }, 0);
      }

      // Stage 1: Approach the exit.
      // Move landscape down MUCH MORE significantly (y: 180)
      tl.to(exitFill, { scale: 2.0, y: 180, duration: 0.5 }, 0);
      tl.to(edgesContainer, { scale: 2.6, duration: 0.5 }, 0);
      
      if (nature) {
        tl.to(nature, { scale: 1.3, duration: 0.5 }, 0);
      }

      // Stage 2: Pass through the exit (foliage and cave edges fly past camera).
      // Even greater final y (y: 600) and scale (8.0) for massive movement
      tl.to(exitFill, { scale: 8.0, y: 600, opacity: 0, duration: 0.5 }, 0.5);
      tl.to(edgesContainer, { scale: 9.0, opacity: 0, duration: 0.5 }, 0.5);
      tl.to(lightMask, { opacity: 0, duration: 0.5 }, 0.5);
      
      if (nature) {
        tl.to(nature, { scale: 1.6, duration: 0.5 }, 0.5);
      }
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


