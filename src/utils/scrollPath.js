// Scroll Path System for Hybrid Navigation
// Defines the circular journey as scroll-based waypoints

const SECTION_OFFSET = 1500; // Same as App.jsx constant

/**
 * Circular path definition with scroll-based waypoints
 * Scroll direction: down = move down spatially (toward South)
 * Path order: Center → South → West → North → East → Center (clockwise from bottom)
 */
export const SCROLL_PATH = {
  totalDistance: 10000, // Total scroll units for complete circle

  sections: [
    // Center (Hero) - Starting point
    {
      id: 'center',
      name: 'Center',
      position: { x: 0, y: 0 },
      scrollStart: 0,
      scrollEnd: 1000,
      stickyZoneSize: 800,
      virtualContentBounds: { width: 600, height: 400 },
      angle: null, // No angle for center (radius = 0)
    },

    // South (Events) - DOWN FIRST (scroll down = go down)
    {
      id: 'south',
      name: 'Events',
      position: { x: 0, y: SECTION_OFFSET * 0.8 }, // +Y = down
      scrollStart: 1000,
      scrollEnd: 3000,
      stickyZoneSize: 1200,
      virtualContentBounds: { width: 600, height: 800 },
      angle: 90, // Bottom of circle (90 degrees)
    },

    // West (Contact) - LEFT
    {
      id: 'west',
      name: 'Contact',
      position: { x: -SECTION_OFFSET, y: 0 }, // -X = left
      scrollStart: 3000,
      scrollEnd: 5000,
      stickyZoneSize: 1000,
      virtualContentBounds: { width: 500, height: 600 },
      angle: 180, // Left of circle (180 degrees)
    },

    // North (Manifesto) - UP
    {
      id: 'north',
      name: 'Manifesto',
      position: { x: 0, y: -SECTION_OFFSET }, // -Y = up
      scrollStart: 5000,
      scrollEnd: 7000,
      stickyZoneSize: 1200,
      virtualContentBounds: { width: 600, height: 800 },
      angle: 270, // Top of circle (270 degrees)
    },

    // East (Participants) - RIGHT
    {
      id: 'east',
      name: 'Participants',
      position: { x: SECTION_OFFSET * 0.8, y: 0 }, // +X = right
      scrollStart: 7000,
      scrollEnd: 9000,
      stickyZoneSize: 1400,
      virtualContentBounds: { width: 900, height: 1000 },
      angle: 0, // Right of circle (0/360 degrees)
    },

    // Return to Center
    {
      id: 'center-return',
      name: 'Center',
      position: { x: 0, y: 0 },
      scrollStart: 9000,
      scrollEnd: 10000,
      stickyZoneSize: 800,
      virtualContentBounds: { width: 600, height: 400 },
      angle: null,
    },
  ],
};

/**
 * Linear interpolation helper
 */
function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Get section from scroll position
 * @param {number} scrollPosition - Absolute scroll position (0 to totalDistance)
 * @returns {object|null} - Section object or null if between sections
 */
export function getSectionFromScroll(scrollPosition) {
  // Normalize scroll position to handle wraparound
  const normalizedScroll = ((scrollPosition % SCROLL_PATH.totalDistance) + SCROLL_PATH.totalDistance) % SCROLL_PATH.totalDistance;

  return SCROLL_PATH.sections.find(
    section => normalizedScroll >= section.scrollStart && normalizedScroll < section.scrollEnd
  ) || null;
}

/**
 * Check if scroll position is within a section's sticky zone
 * @param {number} scrollPosition - Absolute scroll position
 * @param {object} section - Section object
 * @returns {boolean} - True if in sticky zone
 */
export function inStickyZone(scrollPosition, section) {
  if (!section) return false;

  // Normalize scroll position
  const normalizedScroll = ((scrollPosition % SCROLL_PATH.totalDistance) + SCROLL_PATH.totalDistance) % SCROLL_PATH.totalDistance;

  // Calculate section center
  const sectionCenter = (section.scrollStart + section.scrollEnd) / 2;
  const sectionLength = section.scrollEnd - section.scrollStart;

  // Calculate distance from center
  const distanceFromCenter = Math.abs(normalizedScroll - sectionCenter);

  // In sticky zone if within stickyZoneSize/2 of center
  return distanceFromCenter < (section.stickyZoneSize / 2);
}

/**
 * Calculate camera position from scroll progress
 * @param {number} scrollPosition - Absolute scroll position (0 to totalDistance)
 * @returns {object} - { x, y, section, sectionProgress, localProgress }
 */
export function getPositionFromScroll(scrollPosition) {
  // Normalize scroll position to handle wraparound
  const normalizedScroll = ((scrollPosition % SCROLL_PATH.totalDistance) + SCROLL_PATH.totalDistance) % SCROLL_PATH.totalDistance;

  // Find current section
  const currentSection = SCROLL_PATH.sections.find(
    s => normalizedScroll >= s.scrollStart && normalizedScroll < s.scrollEnd
  );

  // If no section found (shouldn't happen with proper path definition)
  if (!currentSection) {
    console.warn('No section found for scroll position:', normalizedScroll);
    return {
      x: 0,
      y: 0,
      section: null,
      sectionProgress: 0,
      localProgress: 0
    };
  }

  // Find next section for interpolation
  const currentIndex = SCROLL_PATH.sections.indexOf(currentSection);
  const nextSection = SCROLL_PATH.sections[(currentIndex + 1) % SCROLL_PATH.sections.length];

  // Calculate progress within current section (0 to 1)
  const sectionLength = currentSection.scrollEnd - currentSection.scrollStart;
  const localProgress = (normalizedScroll - currentSection.scrollStart) / sectionLength;

  // Use easing for smoother transitions
  const easedProgress = easeInOutQuad(localProgress);

  let x, y;

  // Special case: Center section (radius = 0, no angle)
  if (currentSection.angle === null && nextSection.angle !== null) {
    // Transition from center to first section on circle
    // Lerp from (0,0) to next section position
    x = lerp(0, nextSection.position.x, easedProgress);
    y = lerp(0, nextSection.position.y, easedProgress);
  }
  // Special case: Returning to center
  else if (currentSection.angle !== null && nextSection.angle === null) {
    // Transition from circle back to center
    x = lerp(currentSection.position.x, 0, easedProgress);
    y = lerp(currentSection.position.y, 0, easedProgress);
  }
  // Normal case: Moving along circle between sections
  else if (currentSection.angle !== null && nextSection.angle !== null) {
    // Angular interpolation for circular movement
    let startAngle = currentSection.angle;
    let endAngle = nextSection.angle;

    // Handle wraparound (e.g., 270° → 360° instead of 270° → 0°)
    if (endAngle < startAngle) {
      endAngle += 360;
    }

    // Interpolate angle
    const currentAngle = lerp(startAngle, endAngle, easedProgress);
    const radians = (currentAngle * Math.PI) / 180;

    // Calculate radius (interpolate if sections have different radii)
    const currentRadius = Math.sqrt(
      currentSection.position.x ** 2 + currentSection.position.y ** 2
    );
    const nextRadius = Math.sqrt(
      nextSection.position.x ** 2 + nextSection.position.y ** 2
    );
    const radius = lerp(currentRadius, nextRadius, easedProgress);

    // Convert polar to cartesian coordinates
    // Note: 0° = East, 90° = South, 180° = West, 270° = North
    x = Math.cos(radians) * radius;
    y = Math.sin(radians) * radius;
  }
  // Fallback: Both at center
  else {
    x = 0;
    y = 0;
  }

  return {
    x,
    y,
    section: currentSection,
    sectionProgress: localProgress, // Raw progress (0-1) within section
    localProgress: easedProgress,   // Eased progress for smooth movement
  };
}

/**
 * Easing function for smooth transitions
 */
function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Calculate shortest distance between two scroll positions (accounting for wraparound)
 * @param {number} from - Starting scroll position
 * @param {number} to - Target scroll position
 * @returns {number} - Shortest distance (can be negative)
 */
export function getShortestDistance(from, to) {
  const totalDist = SCROLL_PATH.totalDistance;

  // Normalize both positions
  const normFrom = ((from % totalDist) + totalDist) % totalDist;
  const normTo = ((to % totalDist) + totalDist) % totalDist;

  // Calculate direct distance
  let distance = normTo - normFrom;

  // Check if going the other way around is shorter
  if (Math.abs(distance) > totalDist / 2) {
    if (distance > 0) {
      distance = distance - totalDist;
    } else {
      distance = distance + totalDist;
    }
  }

  return distance;
}

/**
 * Get target scroll position for a section (center of section)
 * @param {object} section - Section object
 * @returns {number} - Scroll position at section center
 */
export function getSectionCenterScroll(section) {
  return (section.scrollStart + section.scrollEnd) / 2;
}
