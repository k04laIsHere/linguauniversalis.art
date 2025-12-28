// Navigation Animation - Click-to-Travel functionality
// Animates camera smoothly to target section

import {
  SCROLL_PATH,
  getSectionCenterScroll,
  getShortestDistance,
} from './scrollPath';

/**
 * Easing functions for smooth animations
 */
const easingFunctions = {
  easeInOutCubic: (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  easeOutQuad: (t) => {
    return 1 - (1 - t) * (1 - t);
  },

  easeInOutQuad: (t) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
};

/**
 * Animate to a target section
 * @param {object} scrollProgress - Motion value for scroll progress
 * @param {function} scrollToPosition - Function from useScrollTimeline to set position
 * @param {object} targetSection - Section to navigate to
 * @param {function} onComplete - Callback when animation completes
 */
export function animateToSection(
  scrollProgress,
  scrollToPosition,
  targetSection,
  onComplete
) {
  // Get current and target scroll positions
  const currentPos = scrollProgress.get() * SCROLL_PATH.totalDistance;
  const targetPos = getSectionCenterScroll(targetSection);

  // Calculate shortest distance (accounting for wraparound)
  const distance = getShortestDistance(currentPos, targetPos);

  // Calculate duration based on distance
  // Base duration + distance factor, capped at 2 seconds
  const baseDuration = 500; // ms
  const distanceFactor = Math.abs(distance) / 5; // 1 unit of distance = 0.2ms
  const duration = Math.min(2000, baseDuration + distanceFactor);

  // Start animation
  const startTime = performance.now();
  const startPos = currentPos;
  const endPos = startPos + distance; // Note: can be negative for backward travel

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Apply easing
    const easedProgress = easingFunctions.easeInOutCubic(progress);

    // Calculate new position
    const newPos = startPos + distance * easedProgress;

    // Normalize position (handle wraparound)
    let normalizedPos = newPos;
    if (normalizedPos < 0) {
      normalizedPos = SCROLL_PATH.totalDistance + normalizedPos;
    } else if (normalizedPos > SCROLL_PATH.totalDistance) {
      normalizedPos = normalizedPos - SCROLL_PATH.totalDistance;
    }

    // Update scroll position using the provided function
    scrollToPosition(normalizedPos);

    // Continue animation or complete
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation complete
      if (onComplete) {
        onComplete();
      }
    }
  }

  // Start the animation loop
  requestAnimationFrame(animate);
}

/**
 * Calculate navigation path preview (for future use - showing path line before navigating)
 * @param {number} fromScroll - Starting scroll position
 * @param {object} toSection - Target section
 * @returns {object} - { distance, duration, direction }
 */
export function getNavigationPreview(fromScroll, toSection) {
  const targetPos = getSectionCenterScroll(toSection);
  const distance = getShortestDistance(fromScroll, targetPos);

  const baseDuration = 500;
  const distanceFactor = Math.abs(distance) / 5;
  const duration = Math.min(2000, baseDuration + distanceFactor);

  return {
    distance,
    duration,
    direction: distance > 0 ? 'forward' : 'backward',
  };
}
