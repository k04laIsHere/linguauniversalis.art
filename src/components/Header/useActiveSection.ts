import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState<string>(sectionIds[0] ?? '');

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // We only care about elements that are actually visible in the viewport
        const visible = entries.filter((e) => e.isIntersecting);
        
        if (visible.length > 0) {
          // Find the element that occupies the most of our "active zone" (the middle of the screen)
          const best = visible.sort((a, b) => {
            // Priority 1: Distance from the vertical center of the screen
            const centerA = a.boundingClientRect.top + a.boundingClientRect.height / 2;
            const centerB = b.boundingClientRect.top + b.boundingClientRect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            
            return Math.abs(centerA - viewportCenter) - Math.abs(centerB - viewportCenter);
          })[0];

          if (best?.target?.id) {
            setActive(best.target.id);
          }
        }
      },
      {
        root: null,
        threshold: [0, 0.1, 0.2, 0.5, 0.8],
        rootMargin: '-110px 0px -40% 0px',
      },
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [sectionIds]);

  return active;
}


