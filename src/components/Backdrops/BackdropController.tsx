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

    const showNature = () => gsap.to(nature, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    const hideNature = () => gsap.to(nature, { opacity: 0, duration: 0.5, ease: 'power2.out' });
    const showUrban = () => gsap.to(urban, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    const hideUrban = () => gsap.to(urban, { opacity: 0, duration: 0.5, ease: 'power2.out' });

    let raf: number | null = null;
    const ctx = gsap.context(() => {
      gsap.set(nature, { opacity: 0, transformOrigin: '50% 55%' });
      gsap.set(urban, { opacity: 0, transformOrigin: '50% 50%' });

      // Check for existence of trigger elements before creating ScrollTriggers
      const hasNatureUrban = !!document.getElementById('natureUrban');
      const hasTeam = !!document.getElementById('team');
      const hasEvents = !!document.getElementById('events');

      if (hasNatureUrban) {
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
      }

      if (hasTeam) {
        // If user jumps directly to Team/Events via header, ensure the valley is visible.
        ScrollTrigger.create({
          trigger: '#team',
          start: 'top bottom',
          onEnter: showNature,
          onEnterBack: showNature,
          refreshPriority: 1,
        });
      }

      if (hasEvents) {
        ScrollTrigger.create({
          trigger: '#events',
          start: 'top bottom',
          onEnter: showNature,
          onEnterBack: showNature,
          refreshPriority: 1,
        });
      }

      // General parallax for nature sections after the flight to keep it unified
      if (hasTeam && hasEvents) {
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
          // Start from the final scale of ExitFlight (approx 1.55)
          { scale: 1.55, y: -35 }, 
          { scale: 1.75, y: -100 }
        );
      }

      // Initial sync (covers refresh while scrolled down, and avoids relying on callbacks firing on init).
      raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const y = window.scrollY;
        const galleryEl = document.getElementById('gallery');
        const nuEl = document.getElementById('natureUrban');
        const teamEl = document.getElementById('team');
        const exitEl = document.getElementById('exitFlight');

        // 1. If we are already at/after Gallery (deep link), urban must be visible.
        if (galleryEl && y >= getTop(galleryEl) - 2) {
          gsap.set(nature, { opacity: 0 });
          gsap.set(urban, { opacity: 1 });
          return;
        }

        // 2. If we are already past Nature→Urban, keep urban visible.
        if (nuEl && y >= getTop(nuEl) - 2) {
          // Let the Nature→Urban scrub control the exact state.
          ScrollTrigger.update();
          return;
        }

        // 3. Above Nature→Urban: check if we are in Nature sections (ExitFlight, Team, Events).
        // Use exitEl as the primary start for Nature backdrop.
        const natureStartEl = exitEl || teamEl;
        if (natureStartEl && y + window.innerHeight >= getTop(natureStartEl) - 2) {
          gsap.set(nature, { opacity: 1 });
          gsap.set(urban, { opacity: 0 });
          return;
        }

        // 4. Above ExitFlight: both off.
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


