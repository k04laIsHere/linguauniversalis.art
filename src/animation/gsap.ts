import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

let inited = false;

export function initGsap() {
  if (inited) return;
  inited = true;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // iOS Safari: avoid layout thrash on address bar show/hide.
  ScrollTrigger.config({ ignoreMobileResize: true });
  
  // Normalize scroll for smoother mobile experience
  ScrollTrigger.normalizeScroll(true);
}

export { gsap, ScrollTrigger, ScrollToPlugin };



