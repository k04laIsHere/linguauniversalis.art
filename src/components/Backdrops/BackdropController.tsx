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

    const showNature = () => gsap.to(nature, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    const hideNature = () => gsap.to(nature, { opacity: 0, duration: 0.25, ease: 'power2.out' });
    const showUrban = () => gsap.to(urban, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    const hideUrban = () => gsap.to(urban, { opacity: 0, duration: 0.25, ease: 'power2.out' });

    let raf: number | null = null;
    const ctx = gsap.context(() => {
      gsap.set(nature, { opacity: 0, transformOrigin: '50% 55%' });
      gsap.set(urban, { opacity: 0, transformOrigin: '50% 50%' });

      // Deterministic transition during Nature→Urban pinned beat.
      const nuTl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '#natureUrban',
          start: 'top top',
          end: '+=140%',
          scrub: true,
          refreshPriority: 2,
          invalidateOnRefresh: true,
        },
      });
      // Keep valley fully visible at the start of the beat; crossfade later.
      nuTl
        .set(nature, { opacity: 1 }, 0)
        .set(urban, { opacity: 0 }, 0)
        .to(nature, { opacity: 0, duration: 0.6 }, 0.18)
        .to(urban, { opacity: 1, duration: 0.6 }, 0.18);

      // Nature backdrop ON from ExitFlight onward (until Nature→Urban).
      ScrollTrigger.create({
        trigger: '#exitFlight',
        start: 'top top',
        onEnter: showNature,
        onEnterBack: showNature,
        onLeaveBack: () => {
          hideNature();
          hideUrban();
        },
        refreshPriority: 1,
      });

      // If user jumps directly to Team/Events via header, ensure the valley is visible.
      ScrollTrigger.create({
        trigger: '#team',
        start: 'top bottom',
        onEnter: showNature,
        onEnterBack: showNature,
        refreshPriority: 1,
      });
      ScrollTrigger.create({
        trigger: '#events',
        start: 'top bottom',
        onEnter: showNature,
        onEnterBack: showNature,
        refreshPriority: 1,
      });

      // Subtle valley drift during ExitFlight scrub (fidelity-preserving).
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '#exitFlight',
          start: 'top top',
          end: '+=250%', // Matches the endFlight scroll duration
          scrub: true,
          refreshPriority: 1,
          invalidateOnRefresh: true,
        },
      })
        // Zooming in as we approach the exit hole
        .to(nature, { scale: 1.12, y: -20, duration: 0.5 }, 0)
        // More dramatic zoom as we "pass through" the hole and enter the world
        .to(nature, { scale: 1.25, y: -35, duration: 0.5 }, 0.5);

      // General parallax for nature sections after the flight to keep it unified
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '#team',
          start: 'top bottom',
          endTrigger: '#events',
          end: 'bottom top',
          scrub: true,
          refreshPriority: 1,
        },
      })
      .fromTo(nature, 
        { scale: 1.25, y: -35 }, 
        { scale: 1.45, y: -100 }
      );

      // Initial sync (covers refresh while scrolled down, and avoids relying on callbacks firing on init).
      raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const y = window.scrollY;
        const galleryEl = document.getElementById('gallery');
        const nuEl = document.getElementById('natureUrban');
        const exitEl = document.getElementById('exitFlight');

        // If we are already at/after Gallery (deep link), urban must be visible.
        if (galleryEl && y >= getTop(galleryEl) - 2) {
          gsap.set(nature, { opacity: 0 });
          gsap.set(urban, { opacity: 1 });
          return;
        }

        // If we are already past Nature→Urban, keep urban visible.
        if (nuEl && y >= getTop(nuEl) - 2) {
          // Let the Nature→Urban scrub control the exact state.
          ScrollTrigger.update();
          return;
        }

        // At/after ExitFlight but before Nature→Urban: valley on, urban off.
        if (exitEl && y >= getTop(exitEl) - 2) {
          gsap.set(nature, { opacity: 1 });
          gsap.set(urban, { opacity: 0 });
          return;
        }

        // Above ExitFlight: both off.
        gsap.set(nature, { opacity: 0 });
        gsap.set(urban, { opacity: 0 });
      });
    });

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return null;
}


