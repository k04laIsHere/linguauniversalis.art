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
    const sky = document.getElementById('urbanBackdrop');
    const city = document.getElementById('cityBackdrop');
    if (!nature || !sky || !city) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    if (reduced) return;

    const setNature = () => {
      gsap.to(nature, { opacity: 1, duration: 0.5, overwrite: 'auto' });
      gsap.to([sky, city], { opacity: 0, duration: 0.5, overwrite: 'auto' });
    };
    const setSky = () => {
      gsap.to(sky, { opacity: 1, duration: 0.5, overwrite: 'auto' });
      gsap.to([nature, city], { opacity: 0, duration: 0.5, overwrite: 'auto' });
    };
    const setCity = () => {
      gsap.to(city, { opacity: 1, duration: 0.5, overwrite: 'auto' });
      gsap.to([nature, sky], { opacity: 0, duration: 0.5, overwrite: 'auto' });
    };
    const setNone = () => {
      gsap.to([nature, sky, city], { opacity: 0, duration: 0.5, overwrite: 'auto' });
    };

    let raf: number | null = null;
    const ctx = gsap.context(() => {
      // 1. Initial Zone: Cave to the START of Nature-Sky transition
      ScrollTrigger.create({
        trigger: '#cave',
        endTrigger: '#exitFlight',
        start: 'top top',
        end: 'top top',
        onEnter: () => {
           // Hide fixed nature, we use the relative one at the bottom of cave
           gsap.to(nature, { opacity: 0, duration: 0 });
        },
        onEnterBack: setNature,
        onLeaveBack: setNone,
        refreshPriority: -1,
      });

      // 2. Nature-Sky Transition Zone (ExitFlight)
      const exitFlightEl = document.getElementById('exitFlight');
      const caveEl = document.getElementById('cave');
      if (exitFlightEl) {
        gsap.timeline({
          scrollTrigger: {
            trigger: exitFlightEl,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onEnter: () => {
               gsap.to(nature, { opacity: 1, duration: 0, overwrite: 'auto' });
               // Kill the curtain: Hide the scrollable cave content instantly
               if (caveEl) gsap.to(caveEl, { opacity: 0, duration: 0 });
            },
            onLeave: () => {
               gsap.to(sky, { opacity: 1, duration: 0, overwrite: 'auto' });
               gsap.to(nature, { opacity: 0, duration: 0, overwrite: 'auto' });
            },
            onEnterBack: () => {
               gsap.to(sky, { opacity: 1, duration: 0.1, overwrite: 'auto' });
               gsap.to(nature, { opacity: 0, duration: 0, overwrite: 'auto' }); // Explicitly kill nature when entering sky area from below
               if (caveEl) gsap.to(caveEl, { opacity: 0, duration: 0 });
            },
            onLeaveBack: () => {
               gsap.to(nature, { opacity: 0, duration: 0, overwrite: 'auto' });
               // Restore cave visibility when scrolling back up
               if (caveEl) gsap.to(caveEl, { opacity: 1, duration: 0 });
            },
            refreshPriority: -1,
          }
        })
        .to(nature, { opacity: 1, duration: 0 }, 0) // Force nature to stay at 1
        .to(nature, { opacity: 0, ease: 'none' }, 0.8) // Start fading MUCH later
        .to(sky, { opacity: 1, ease: 'none' }, 0.85); // Fade sky in exactly as nature finishes
      }

      // 3. Sky Zone: From ExitFlight to NatureUrban
      ScrollTrigger.create({
        trigger: '#team',
        start: 'top bottom',
        endTrigger: '#natureUrban',
        end: 'top top',
        onEnter: setSky,
        onEnterBack: setSky,
        // Added onToggle and onUpdate to ensure backdrop stays Sky even after fast jumps
        onToggle: (self) => self.isActive && setSky(),
        refreshPriority: -1,
      });

      // 4. Sky-City Transition Zone (NatureUrbanPlaceholder)
      const nuEl = document.getElementById('natureUrban');
      if (nuEl) {
        gsap.timeline({
          scrollTrigger: {
            trigger: nuEl,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onEnter: () => {
              gsap.to(sky, { opacity: 1, duration: 0.1, overwrite: 'auto' });
            },
            onLeave: () => {
              gsap.to(city, { opacity: 1, duration: 0.1, overwrite: 'auto' });
            },
            onEnterBack: () => {
              gsap.to(city, { opacity: 1, duration: 0.1, overwrite: 'auto' });
            },
            onLeaveBack: () => {
              gsap.to(sky, { opacity: 1, duration: 0.1, overwrite: 'auto' });
            },
            refreshPriority: -1,
          }
        })
        .to(sky, { opacity: 0, ease: 'none' }, 0.6)
        .to(city, { opacity: 1, ease: 'none' }, 0.65);
      }

      // 5. Final Zone: City
      ScrollTrigger.create({
        trigger: '#gallery',
        start: 'top bottom',
        endTrigger: 'html',
        end: 'bottom bottom',
        onEnter: setCity,
        onEnterBack: setCity,
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
          setCity();
        } else if (nuEl && y >= getTop(nuEl) - 10) {
          setSky();
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
