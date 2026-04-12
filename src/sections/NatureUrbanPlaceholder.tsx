import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollTrigger, initGsap, gsap } from '../animation/gsap';
import styles from './NatureUrbanPlaceholder.module.css';

export function NatureUrbanPlaceholder() {
  const rootRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
    [],
  );

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    initGsap();

    let lastWidth = window.innerWidth;
    const lockHeight = () => {
      if (window.innerWidth !== lastWidth || !root.style.height) {
        root.style.height = `${window.innerHeight}px`;
        lastWidth = window.innerWidth;
        if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
          ScrollTrigger.refresh();
        }
      }
    };
    lockHeight();
    window.addEventListener('resize', lockHeight);

    // Metadata might not be loaded yet, but we can setup the scrub
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      });

      // Video scrubbing
      tl.to(video, 
        { 
          currentTime: () => video.duration || 0,
          ease: 'none',
        }, 0);

      // Simple cross-fade logic:
      // The backdrops (nature/urban) are controlled by BackdropController.
      // This video (SkyToCity) sits on top and fades in to hide the switch.
      tl.fromTo(video, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0);
      tl.to(video, { opacity: 0, duration: 0.1 }, 0.9);
    }, root);

    // Update duration when loaded
    const onLoadedMetadata = () => {
       ScrollTrigger.refresh();
       if (video) video.currentTime = 0;
    };
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      ctx.revert();
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      window.removeEventListener('resize', lockHeight);
    };
  }, [reduced]);

  return (
    <section id="natureUrban" ref={rootRef} className={styles.root} aria-label="Nature to Urban">
      <video 
        ref={videoRef} 
        className={styles.canvas} 
        src="/assets/videos/SkyToCity.webp" 
        muted 
        playsInline 
        preload="auto"
      />
    </section>
  );
}
