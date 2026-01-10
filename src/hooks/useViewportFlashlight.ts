import { useEffect, useRef } from 'react';

type Options = {
  /** Default flashlight radius (px) for mouse/pen. */
  radius?: number;
  /** Default flashlight radius (px) for touch. */
  touchRadius?: number;
  /** Initial center position (viewport px). */
  defaultPos?: { x: number; y: number };
  /** CSS var name prefix (defaults to `--lu_`). */
  varPrefix?: string;
  /** Element to attach listeners to. Defaults to `window`. */
  target?: Window | HTMLElement | null;
  /** Disable if needed (e.g., reduced motion). */
  enabled?: boolean;
};

/**
 * Tracks pointer position in viewport coordinates and writes CSS vars in px.
 * Includes organic jitter/flicker for immersion.
 */
export function useViewportFlashlight(options: Options = {}) {
  const {
    radius = 520,
    touchRadius = 760,
    defaultPos = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.45 },
    varPrefix = '--lu_',
    target = window,
    enabled = true,
  } = options;

  const posRef = useRef({ x: defaultPos.x, y: defaultPos.y, r: radius });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const t = target;
    if (!t) return;

    const root = document.documentElement;
    
    const tick = () => {
      const { x, y, r } = posRef.current;
      // Add subtle organic flicker
      const jitter = (Math.random() - 0.5) * 4;
      const flicker = 0.98 + Math.random() * 0.04;
      
      root.style.setProperty(`${varPrefix}x`, `${Math.round(x)}px`);
      root.style.setProperty(`${varPrefix}y`, `${Math.round(y)}px`);
      root.style.setProperty(`${varPrefix}r`, `${Math.round((r + jitter) * flicker)}px`);
      
      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = e.pointerType === 'touch' ? touchRadius : radius;
      posRef.current = { x: e.clientX, y: e.clientY, r };
    };

    const onLeave = () => {
      posRef.current = { x: defaultPos.x, y: defaultPos.y, r: radius };
    };

    onLeave();
    rafRef.current = requestAnimationFrame(tick);

    // Attach listeners
    (t as any).addEventListener?.('pointermove', onMove, { passive: true });
    (t as any).addEventListener?.('pointerleave', onLeave, { passive: true });
    (t as any).addEventListener?.('pointercancel', onLeave, { passive: true });
    (t as any).addEventListener?.('blur', onLeave, { passive: true });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      (t as any).removeEventListener?.('pointermove', onMove);
      (t as any).removeEventListener?.('pointerleave', onLeave);
      (t as any).removeEventListener?.('pointercancel', onLeave);
      (t as any).removeEventListener?.('blur', onLeave);
    };
  }, [enabled, radius, touchRadius, target, varPrefix, defaultPos.x, defaultPos.y]);
}


