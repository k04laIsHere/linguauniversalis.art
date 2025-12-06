// Scroll Timeline Hook - Core scroll handling system
// Manages scroll events, friction states, and flashlight scan progress

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMotionValue } from 'framer-motion';
import {
  SCROLL_PATH,
  getSectionFromScroll,
  inStickyZone,
} from '../utils/scrollPath';
import {
  FRICTION_STATES,
  getNextFrictionState,
  applyFriction,
} from '../utils/frictionStates';

/**
 * Custom hook for scroll-based timeline navigation
 * @param {boolean} isMobile - Whether the device is mobile
 * @returns {object} - Scroll state and control functions
 */
export function useScrollTimeline(isMobile = false) {
  // Core scroll progress (0 to totalDistance)
  const scrollPosition = useMotionValue(0);

  // Scroll progress as 0-1 for full circle (derived from scrollPosition)
  const scrollProgress = useMotionValue(0);

  // Current friction state
  const [frictionState, setFrictionState] = useState(FRICTION_STATES.TRAVEL.name);

  // Current section
  const [currentSection, setCurrentSection] = useState(null);

  // Flashlight scan progress (0-1) for current sticky zone
  const flashlightScanProgress = useRef(0);

  // Track if currently in sticky zone
  const [inSticky, setInSticky] = useState(false);

  // Animation frame reference
  const animationFrameRef = useRef(null);

  // Touch tracking for mobile
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const touchStartTime = useRef(0);

  /**
   * Apply scroll delta and update position
   */
  const applyScrollDelta = useCallback((delta) => {
    const currentPos = scrollPosition.get();
    const section = getSectionFromScroll(currentPos);
    const isInSticky = section ? inStickyZone(currentPos, section) : false;

    // Determine current friction state
    const currentFrictionState = FRICTION_STATES[frictionState];

    // In STICKY_LOCKED, accumulate scroll for flashlight scan
    if (frictionState === FRICTION_STATES.STICKY_LOCKED.name) {
      if (section) {
        // Calculate virtual content height for scan progress
        const virtualHeight = section.virtualContentBounds.height * 1.5; // Balanced scan speed

        // Accumulate scan progress (positive only, direction agnostic)
        flashlightScanProgress.current += Math.abs(delta) / virtualHeight;

        // Clamp to 0-1 range
        flashlightScanProgress.current = Math.max(0, Math.min(1, flashlightScanProgress.current));

        // Update friction state if scan complete
        if (flashlightScanProgress.current >= 1.0) {
          setFrictionState(FRICTION_STATES.STICKY_EXITING.name);
          flashlightScanProgress.current = 0; // Reset for next section
        }
      }
      // Camera stays locked, don't move
      return;
    }

    // Apply friction multiplier
    const modifiedDelta = applyFriction(delta, currentFrictionState);

    // Update scroll position
    let newPos = currentPos + modifiedDelta;

    // Handle wraparound (optional - can remove if you don't want circular wrapping)
    if (newPos < 0) {
      newPos = SCROLL_PATH.totalDistance + newPos;
    } else if (newPos > SCROLL_PATH.totalDistance) {
      newPos = newPos - SCROLL_PATH.totalDistance;
    }

    // Clamp to path bounds (prevent negative or over-limit)
    newPos = Math.max(0, Math.min(SCROLL_PATH.totalDistance, newPos));

    scrollPosition.set(newPos);
    scrollProgress.set(newPos / SCROLL_PATH.totalDistance);

    // Update section and sticky state
    const newSection = getSectionFromScroll(newPos);
    setCurrentSection(newSection);

    const newIsInSticky = newSection ? inStickyZone(newPos, newSection) : false;
    setInSticky(newIsInSticky);

    // Update friction state
    const newFrictionState = getNextFrictionState(
      frictionState,
      newPos,
      newSection,
      newIsInSticky,
      flashlightScanProgress.current
    );

    if (newFrictionState.name !== frictionState) {
      setFrictionState(newFrictionState.name);

      // Reset scan progress when entering a new sticky zone
      if (newFrictionState.name === FRICTION_STATES.STICKY_LOCKED.name) {
        flashlightScanProgress.current = 0;
      }
    }
  }, [scrollPosition, scrollProgress, frictionState]);

  /**
   * Desktop wheel event handler
   */
  useEffect(() => {
    if (isMobile) return;

    const handleWheel = (e) => {
      e.preventDefault();

      // Use deltaY for vertical scroll
      const delta = e.deltaY;

      applyScrollDelta(delta);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isMobile, applyScrollDelta]);

  /**
   * Mobile touch event handlers
   */
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e) => {
      if (e.touches[0]) {
        touchStartY.current = e.touches[0].clientY;
        lastTouchY.current = touchStartY.current;
        touchStartTime.current = Date.now();
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();

      if (e.touches[0]) {
        const touchY = e.touches[0].clientY;
        const delta = lastTouchY.current - touchY; // Invert for natural scroll direction
        lastTouchY.current = touchY;

        // Apply scroll with touch delta
        // Touch delta is typically smaller than wheel delta, so scale it up
        applyScrollDelta(delta * 2); // 2x multiplier for more responsive touch
      }
    };

    const handleTouchEnd = (e) => {
      // Could add momentum scrolling here in the future
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime.current;
      const touchDistance = Math.abs(lastTouchY.current - touchStartY.current);

      // Calculate velocity for potential momentum (not implemented yet)
      // const velocity = touchDistance / touchDuration;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, applyScrollDelta]);

  /**
   * Manual scroll to position (for click-to-travel)
   */
  const scrollToPosition = useCallback((targetPosition) => {
    scrollPosition.set(targetPosition);
    scrollProgress.set(targetPosition / SCROLL_PATH.totalDistance);

    // Update section
    const newSection = getSectionFromScroll(targetPosition);
    setCurrentSection(newSection);

    // Reset scan progress
    flashlightScanProgress.current = 0;

    // Set appropriate friction state
    const newIsInSticky = newSection ? inStickyZone(targetPosition, newSection) : false;
    setInSticky(newIsInSticky);

    const newFrictionState = getNextFrictionState(
      frictionState,
      targetPosition,
      newSection,
      newIsInSticky,
      0
    );
    setFrictionState(newFrictionState.name);
  }, [scrollPosition, scrollProgress, frictionState]);

  return {
    scrollPosition,      // Motion value: absolute scroll position (0 to totalDistance)
    scrollProgress,      // Motion value: normalized progress (0 to 1)
    frictionState,       // String: current friction state name
    currentSection,      // Object: current section or null
    inSticky,           // Boolean: whether in sticky zone
    flashlightScanProgress, // Ref: scan progress (0-1)
    scrollToPosition,   // Function: programmatically set scroll position
  };
}
