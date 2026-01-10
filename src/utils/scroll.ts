import { ScrollTrigger, initGsap, gsap } from '../animation/gsap';

/**
 * Robust scroll to element that accounts for GSAP ScrollTrigger pins.
 */
export function scrollToId(id: string) {
  initGsap();
  
  // 1. Force a refresh to ensure all pin spacers are accurately measured.
  // We do it before and after a tiny delay to be sure.
  ScrollTrigger.refresh();

  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[scrollToId] Element with id "${id}" not found.`);
    return;
  }

  // 2. Wait a frame for layout to settle, then calculate and scroll.
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    
    // Create a temporary ScrollTrigger to find the TRUE scroll position
    // where the element's top meets our desired offset.
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 110px',
    });
    let scrollPos = st.start;
    st.kill();

    // Specific landing adjustment for "Events" section to reveal the first image
    if (id === 'events') {
      scrollPos += window.innerHeight * 0.8;
    }

    // 3. Perform the scroll with GSAP
    gsap.to(window, {
      duration: 1.5,
      scrollTo: {
        y: scrollPos,
        autoKill: true
      },
      ease: 'power3.inOut',
      onComplete: () => {
        // Final refresh to ensure everything is in sync after the journey
        ScrollTrigger.refresh();
        
        // Update hash in history without causing a jump
        const currentHashParts = window.location.hash.split('?');
        const targetHash = `#${id}`;
        if (currentHashParts[0] !== targetHash) {
          const query = currentHashParts[1] ? `?${currentHashParts[1]}` : '';
          window.history.pushState(null, '', `${targetHash}${query}`);
        }
      }
    });
  });
}


