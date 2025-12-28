// Friction State Machine for Hybrid Navigation
// Defines scroll behavior states and transitions

/**
 * Friction states for scroll-based navigation
 * Each state has different scroll multipliers and behaviors
 */
export const FRICTION_STATES = {
  TRAVEL: {
    name: 'TRAVEL',
    scrollMultiplier: 5.0, // Fast movement between sections
    description: 'Fast travel between sections',
    cameraLocked: false,
    flashlightFollowsScroll: false, // Mobile flashlight follows touch
    zoomOut: true, // Zoom out for context during travel
  },

  STICKY_ENTERING: {
    name: 'STICKY_ENTERING',
    scrollMultiplier: 2.0, // Deceleration as approaching section
    description: 'Approaching section, slowing down',
    cameraLocked: false,
    flashlightFollowsScroll: false,
    zoomOut: false, // Return to normal zoom
  },

  STICKY_LOCKED: {
    name: 'STICKY_LOCKED',
    scrollMultiplier: 0.0, // Camera frozen, flashlight scans
    description: 'Reading section content, camera locked',
    cameraLocked: true,
    flashlightFollowsScroll: true, // Mobile scanner mode active
    zoomOut: false,
  },

  STICKY_EXITING: {
    name: 'STICKY_EXITING',
    scrollMultiplier: 0.5, // Slow acceleration out of section
    description: 'Exiting section, slow acceleration',
    cameraLocked: false,
    flashlightFollowsScroll: false,
    zoomOut: false,
  },
};

/**
 * Determine next friction state based on current state and scroll position
 * @param {string} currentState - Current friction state name
 * @param {number} scrollPosition - Current scroll position
 * @param {object} section - Current section (or null if in travel zone)
 * @param {boolean} inSticky - Whether currently in sticky zone
 * @param {number} flashlightScanProgress - Progress of flashlight scan (0-1)
 * @returns {object} - Next friction state
 */
export function getNextFrictionState(
  currentState,
  scrollPosition,
  section,
  inSticky,
  flashlightScanProgress
) {
  // No section = travel zone
  if (!section) {
    return FRICTION_STATES.TRAVEL;
  }

  // In sticky zone
  if (inSticky) {
    // If already locked, stay locked until scan completes
    if (currentState === FRICTION_STATES.STICKY_LOCKED.name) {
      if (flashlightScanProgress >= 1.0) {
        // Scan complete, transition to exiting
        return FRICTION_STATES.STICKY_EXITING;
      }
      return FRICTION_STATES.STICKY_LOCKED;
    }

    // Entering sticky zone
    if (currentState === FRICTION_STATES.TRAVEL.name ||
        currentState === FRICTION_STATES.STICKY_ENTERING.name) {
      // Check if we're close enough to center to lock
      const sectionCenter = (section.scrollStart + section.scrollEnd) / 2;
      const distanceFromCenter = Math.abs(scrollPosition - sectionCenter);
      const lockThreshold = section.stickyZoneSize * 0.8; // Lock when within 80% of sticky zone

      if (distanceFromCenter < lockThreshold) {
        return FRICTION_STATES.STICKY_LOCKED;
      }

      return FRICTION_STATES.STICKY_ENTERING;
    }

    // Exiting but still in sticky zone
    if (currentState === FRICTION_STATES.STICKY_EXITING.name) {
      return FRICTION_STATES.STICKY_EXITING;
    }
  }

  // Near section but outside sticky zone
  if (section) {
    const sectionCenter = (section.scrollStart + section.scrollEnd) / 2;
    const distanceFromCenter = Math.abs(scrollPosition - sectionCenter);
    const approachRadius = section.stickyZoneSize * 0.75; // Approach zone is slightly larger

    if (distanceFromCenter < approachRadius) {
      // Coming from locked state = exiting
      if (currentState === FRICTION_STATES.STICKY_LOCKED.name ||
          currentState === FRICTION_STATES.STICKY_EXITING.name) {
        return FRICTION_STATES.STICKY_EXITING;
      }
      // Coming from travel = entering
      return FRICTION_STATES.STICKY_ENTERING;
    }
  }

  // Far from any section = travel
  return FRICTION_STATES.TRAVEL;
}

/**
 * Apply friction multiplier to scroll delta
 * @param {number} scrollDelta - Raw scroll delta from wheel/touch event
 * @param {object} frictionState - Current friction state object
 * @returns {number} - Modified scroll delta
 */
export function applyFriction(scrollDelta, frictionState) {
  return scrollDelta * frictionState.scrollMultiplier;
}

/**
 * Get zoom progress based on friction state (0 = default zoom, 1 = zoomed out)
 * @param {string} stateName - Friction state name
 * @returns {number} - Zoom progress (0-1)
 */
export function getZoomProgress(stateName) {
  const state = FRICTION_STATES[stateName];
  return state?.zoomOut ? 1 : 0;
}
