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
        filter: 'brightness(1.2) contrast(1.1)' // Removed saturate(1)
      });
      
      // Ensure exit fill is visible from start
      gsap.set(exitFill, { 
        opacity: 1, 
        y: -200, 
        scale: 1, 
        filter: 'brightness(0.8) contrast(1.1)' // Removed saturate
      });

      // Nature backdrop should be ready and BRIGHT
      if (nature) {
        gsap.set(nature, { 
          opacity: 1, 
          filter: 'brightness(1.1) contrast(1.05)', 
          scale: 1.4, 
        });
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' }, 
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=500%', 
          scrub: 1.5, 
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
      // 1. Initial fade in for brightness
      tl.to([baseDark, exitFill], { 
        filter: 'brightness(1.5) contrast(1.1)', // Removed saturate(1)
        duration: 1 
      }, 0);

      // 2. Zoom out the nature backdrop
      if (nature) {
        tl.to(nature, {
          scale: 1,
          y: 0,
          duration: 4,
          ease: 'power1.inOut'
        }, 0);
      }

      // 3. Zoom in the wall and arch - keep them sharp
      tl.fromTo([baseDark, caveEdges, edgesContainer], 
      {
         scale: 1,
         opacity: 1,
         yPercent: 0
      },
      { 
        scale: 15, // Increased scale to fully clear view
        opacity: 1, 
        yPercent: 20, // Moved lower
        duration: 3,
        ease: 'power2.in',
        immediateRender: false 
      }, 0.1);

      // 4. The landscape (vegetation mask) moves DOWN smoothly
      tl.to(exitFill,
      { 
        y: '250vh', // Using vh for better responsiveness
        scale: 1.1, // Slight zoom to keep edges hidden during movement
        duration: 2.5, 
        ease: 'power2.inOut',
        immediateRender: false 
      }, 0);

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


