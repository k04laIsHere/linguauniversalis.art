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
    const baseDark = baseDarkRef.current;
    const edgesContainer = edgesContainerRef.current;
    if (!root || !pin || !exitFill || !caveEdges || !baseDark || !edgesContainer) return;

    initGsap();

    const ctx = gsap.context(() => {
      const nature = document.getElementById('natureBackdrop');

      const origin = '50% 45%';
      gsap.set([exitFill, caveEdges, baseDark, edgesContainer], { 
        transformOrigin: origin,
        force3D: true, 
      });

      // 1. Initial State: Flashlight is OFF (gone by the end of Cave section).
      // Sync baseDark with Cave section's end state
      gsap.set(baseDark, { 
        opacity: 1, 
        yPercent: 0,
        filter: 'brightness(1.2) contrast(1.1) saturate(1)' // Start bright
      });
      
      // Ensure exit fill is visible from start
      gsap.set(exitFill, { 
        opacity: 1, 
        y: -400, // Even higher initial position
        scale: 1.2,
        filter: 'brightness(0.8) contrast(1.1)'
      });

      // Nature backdrop should be ready and BRIGHT
      if (nature) {
        gsap.set(nature, { 
          opacity: 1, // Start visible to avoid "darkness at first"
          filter: 'brightness(1.1) contrast(1.05)', 
          scale: 1.4, // Increased zoom for a stronger transition
        });
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=450%', 
          scrub: 1,
          pin: root,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => {
            // Coordinator with BackdropController
            if (nature) gsap.to(nature, { opacity: 1, duration: 0.3 });
          }
        },
      });

      // The transition:
      // 1. First, make the cave walls bright
      tl.to(baseDark, { 
        filter: 'brightness(1.5) contrast(1.1) saturate(1)', 
        duration: 0.8 
      }, 0);

      tl.to(exitFill, {
        filter: 'brightness(1.2) contrast(1.1)',
        duration: 0.8
      }, 0);

      // 2. Zoom out the nature backdrop from the very start
      if (nature) {
        tl.to(nature, {
          scale: 1, // Final unzoomed state
          y: 0,
          duration: 4,
          ease: 'power1.inOut'
        }, 0);
      }

      // 3. Zoom in the wall and arch with parallax
      tl.fromTo([baseDark, caveEdges, edgesContainer], 
      {
         scale: 1,
         opacity: 1,
         yPercent: 0
      },
      { 
        scale: 12, 
        opacity: 0, 
        yPercent: 15,
        duration: 3,
        ease: 'power2.in',
        immediateRender: false // Prevent conflict with initial set
      }, 0.2);

      // 4. The landscape (vegetation mask) zooms in and moves DOWN
      // Make sure it stays visible longer before fading
      tl.to(exitFill,
      { 
        scale: 6, 
        y: 800, 
        opacity: 0,
        duration: 3.5,
        ease: 'power1.inOut',
        immediateRender: false // Prevent conflict with initial set
      }, 0.3);

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

        <div className={styles.wallsContainer} ref={edgesContainerRef}>
          <div ref={baseDarkRef} className={styles.baseDark} aria-hidden="true" />
          <div
            ref={caveEdgesRef}
            className={styles.caveEdges}
            aria-hidden="true"
          />
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


