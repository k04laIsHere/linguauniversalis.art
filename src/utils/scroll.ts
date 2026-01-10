import { ScrollTrigger, initGsap } from '../animation/gsap';

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Smooth scrolling can leave ScrollTrigger pin spacers slightly stale until the next refresh.
  // Refresh shortly after navigation to keep pinned scenes and backdrops in sync.
  try {
    initGsap();
    window.setTimeout(() => ScrollTrigger.refresh(), 250);
    window.setTimeout(() => ScrollTrigger.refresh(), 900);
  } catch {
    // ignore
  }
}


