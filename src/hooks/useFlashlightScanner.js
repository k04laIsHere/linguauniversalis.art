// Flashlight Scanner Hook
// Desktop: Free-look (follows mouse)
// Mobile: Grid pattern scanner (5×3 grid) in sticky zones

import { useTransform, useSpring } from 'framer-motion';
import { FRICTION_STATES } from '../utils/frictionStates';

// Grid configuration for mobile scanner
const SCANNER_GRID = {
  rows: 5,
  cols: 3,
};

/**
 * Calculate flashlight position with desktop free-look and mobile grid scanner
 * @param {object} params - Configuration object
 * @returns {object} - { flashlightX, flashlightY } motion values
 */
export function useFlashlightScanner({
  isMobile,
  frictionState,
  currentSection,
  flashlightScanProgress, // Ref from useScrollTimeline
  mouseX, // Existing motion value from mouse/touch tracking
  mouseY, // Existing motion value from mouse/touch tracking
  finalCameraX, // Camera position motion value
  finalCameraY, // Camera position motion value
  winSize, // { w, h } window dimensions
}) {
  /**
   * Flashlight X position
   */
  const flashlightX = useTransform(() => {
    // Desktop: Free-look mode (always follow mouse)
    if (!isMobile) {
      return mouseX.get();
    }

    // Mobile: Check if in sticky locked state for grid scanner
    if (
      frictionState === FRICTION_STATES.STICKY_LOCKED.name &&
      currentSection &&
      flashlightScanProgress.current !== undefined
    ) {
      // Grid scanner mode
      const progress = flashlightScanProgress.current;
      const bounds = currentSection.virtualContentBounds;
      const { x: sectionX, y: sectionY } = currentSection.position;

      // Calculate grid position
      const { rows, cols } = SCANNER_GRID;
      const totalPositions = rows * cols;
      const currentPos = Math.floor(progress * totalPositions);

      // Grid position (row, col)
      const row = Math.floor(currentPos / cols);
      const col = currentPos % cols;

      // Map to local coordinates (within section bounds)
      // Center the grid within the section
      const localX = (col / (cols - 1)) * bounds.width - bounds.width / 2;

      // Convert to screen coordinates
      // Account for camera offset (camera moves negative, content appears to move positive)
      const screenX = winSize.w / 2 + sectionX - finalCameraX.get() + localX;

      return screenX;
    }

    // Mobile: Outside sticky locked state - follow touch
    return mouseX.get();
  });

  /**
   * Flashlight Y position
   */
  const flashlightY = useTransform(() => {
    // Desktop: Free-look mode (always follow mouse)
    if (!isMobile) {
      return mouseY.get();
    }

    // Mobile: Check if in sticky locked state for grid scanner
    if (
      frictionState === FRICTION_STATES.STICKY_LOCKED.name &&
      currentSection &&
      flashlightScanProgress.current !== undefined
    ) {
      // Grid scanner mode
      const progress = flashlightScanProgress.current;
      const bounds = currentSection.virtualContentBounds;
      const { x: sectionX, y: sectionY } = currentSection.position;

      // Calculate grid position
      const { rows, cols } = SCANNER_GRID;
      const totalPositions = rows * cols;
      const currentPos = Math.floor(progress * totalPositions);

      // Grid position (row, col)
      const row = Math.floor(currentPos / cols);
      const col = currentPos % cols;

      // Map to local coordinates (within section bounds)
      // Center the grid within the section
      const localY = (row / (rows - 1)) * bounds.height - bounds.height / 2;

      // Convert to screen coordinates
      // Account for camera offset (camera moves negative, content appears to move positive)
      const screenY = winSize.h / 2 + sectionY - finalCameraY.get() + localY;

      return screenY;
    }

    // Mobile: Outside sticky locked state - follow touch
    return mouseY.get();
  });

  /**
   * Smooth flashlight movement with spring animation
   * Faster spring in scanner mode for responsive grid transitions
   */
  const springConfig =
    isMobile && frictionState === FRICTION_STATES.STICKY_LOCKED.name
      ? { stiffness: 200, damping: 30 } // Faster for grid scanning
      : { stiffness: 150, damping: 25 }; // Original smooth following

  const smoothFlashlightX = useSpring(flashlightX, springConfig);
  const smoothFlashlightY = useSpring(flashlightY, springConfig);

  return {
    flashlightX: smoothFlashlightX,
    flashlightY: smoothFlashlightY,
  };
}
