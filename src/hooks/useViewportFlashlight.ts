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
 * Includes organic jitter/flicker for immersion and smooth tracking.
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

  // targetPos is where we want to be, currentPos is where we are (for smoothing)
  const targetPosRef = useRef({ x: defaultPos.x, y: defaultPos.y, r: radius });
  const currentPosRef = useRef({ x: defaultPos.x, y: defaultPos.y, r: radius });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const t = target;
    if (!t) return;

    const root = document.documentElement;
    
    const tick = () => {
      // Smoother, heavier lerp toward target
      const lerp = 0.06; // Reduced from 0.15 for heavier feel
      
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * lerp;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * lerp;
      currentPosRef.current.r += (targetPosRef.current.r - currentPosRef.current.r) * lerp;

      const { x, y, r } = currentPosRef.current;
      
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
      targetPosRef.current = { x: e.clientX, y: e.clientY, r };
    };

    const onLeave = () => {
      // No longer automatically snapping to center on mobile to prevent "jumps" 
      // during scroll-induced leave events. Only reset if it's a mouse leaving.
      if (!window.matchMedia('(pointer: coarse)').matches) {
        targetPosRef.current = { x: defaultPos.x, y: defaultPos.y, r: radius };
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    // Attach listeners
    (t as any).addEventListener?.('pointermove', onMove, { passive: true });
    (t as any).addEventListener?.('pointerdown', onMove, { passive: true });
    (t as any).addEventListener?.('pointerleave', onLeave, { passive: true });
    (t as any).addEventListener?.('pointercancel', onLeave, { passive: true });
    (t as any).addEventListener?.('blur', onLeave, { passive: true });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      (t as any).removeEventListener?.('pointermove', onMove);
      (t as any).removeEventListener?.('pointerdown', onMove);
      (t as any).removeEventListener?.('pointerleave', onLeave);
      (t as any).removeEventListener?.('pointercancel', onLeave);
      (t as any).removeEventListener?.('blur', onLeave);
    };
  }, [enabled, radius, touchRadius, target, varPrefix, defaultPos.x, defaultPos.y]);
}


