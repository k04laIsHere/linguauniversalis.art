import { useEffect } from 'react';
import { gsap, ScrollTrigger, initGsap } from '../../animation/gsap';

function getTop(el: Element) {
  const r = (el as HTMLElement).getBoundingClientRect();
  return r.top + window.scrollY;
}

export function BackdropController() {
  useEffect(() => {
    initGsap();

    const nature = document.getElementById('natureBackdrop');
    const urban = document.getElementById('urbanBackdrop');
    if (!nature || !urban) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    if (reduced) return;

    const setNature = () => {
      // Only set opacity, don't kill other tweens like scale or filter
      gsap.to(nature, { opacity: 1, duration: 0.5, overwrite: 'auto' });
      gsap.to(urban, { opacity: 0, duration: 0.5, overwrite: 'auto' });
    };
    const setUrban = () => {
      gsap.to(urban, { opacity: 1, duration: 0.5, overwrite: 'auto' });
      gsap.to(nature, { opacity: 0, duration: 0.5, overwrite: 'auto' });
    };
    const setNone = () => {
      gsap.to([nature, urban], { opacity: 0, duration: 0.5, overwrite: 'auto' });
    };

    let raf: number | null = null;
    const ctx = gsap.context(() => {
      // 1. Nature Zone: From ExitFlight to the START of NatureUrban
      ScrollTrigger.create({
        trigger: '#exitFlight',
        endTrigger: '#natureUrban',
        start: 'top bottom',
        end: 'top top',
        onEnter: setNature,
        onEnterBack: setNature,
        onLeave: () => {
          // Handled by nuTl
        },
        onLeaveBack: setNone,
        refreshPriority: -1, // Wait for all pins to settle
      });

      // 2. NatureUrban Transition Zone
      const nuEl = document.getElementById('natureUrban');
      if (nuEl) {
        const nuTl = gsap.timeline({
          scrollTrigger: {
            trigger: nuEl,
            start: 'top bottom', // Start trigger as soon as section enters viewport
            end: 'bottom top',   // End trigger as soon as section leaves
            scrub: true,
            onEnter: () => {
              // Ensure nature starts fully visible
              gsap.to(nature, { opacity: 1, duration: 0.1, overwrite: 'auto' });
            },
            onLeave: () => {
              // Ensure urban ends fully visible
              gsap.to(urban, { opacity: 1, duration: 0.1, overwrite: 'auto' });
            },
            onEnterBack: () => {
              gsap.to(urban, { opacity: 1, duration: 0.1, overwrite: 'auto' });
            },
            onLeaveBack: () => {
              gsap.to(nature, { opacity: 1, duration: 0.1, overwrite: 'auto' });
            },
            refreshPriority: -1,
          }
        });

        // Crossfade: Nature fades out while Urban fades in
        nuTl
          .to(nature, { opacity: 0, ease: 'none' }, 0.1)
          .to(urban, { opacity: 1, ease: 'none' }, 0.8);
      }

      // 3. Urban Zone: From end of NatureUrban to the end of site
      ScrollTrigger.create({
        trigger: '#gallery',
        start: 'top bottom',
        endTrigger: 'html',
        end: 'bottom bottom',
        onEnter: setUrban,
        onEnterBack: setUrban,
        onLeaveBack: () => {
           // Transition will handle it
        },
        refreshPriority: -1,
      });

      // Initial sync
      raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const y = window.scrollY;
        const galleryEl = document.getElementById('gallery');
        const nuEl = document.getElementById('natureUrban');
        const natureStartEl = document.getElementById('exitFlight');

        if (galleryEl && y >= getTop(galleryEl) - 10) {
          setUrban();
        } else if (nuEl && y >= getTop(nuEl) - 10) {
          // Inside transition section, let scrub handle it
          // But set a safe fallback state if scrub hasn't kicked in
          if (y < getTop(nuEl) + (nuEl.offsetHeight * 0.1)) {
             setNature();
          } else if (y > getTop(nuEl) + (nuEl.offsetHeight * 0.9)) {
             setUrban();
          }
        } else if (natureStartEl && y + window.innerHeight >= getTop(natureStartEl)) {
          setNature();
        } else {
          setNone();
        }
      });
    });

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return null;
}
