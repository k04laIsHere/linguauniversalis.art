// Scroll Path System for Hybrid Navigation
// Defines the circular journey as scroll-based waypoints

const SECTION_OFFSET = 1500; // Same as App.jsx constant

/**
 * Circular path definition with scroll-based waypoints
 * Scroll direction: down = move down spatially (toward South)
 * Path order: Center → North → East → South → West → Center
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
      stickyZoneSize: 800, // Scroll units where camera locks
      virtualContentBounds: {
        width: 600,  // Width of flashlight scan area
        height: 400  // Height of flashlight scan area
      },
    },

    // North (Manifesto/About) - scroll down = camera moves down, so North is first
    {
      id: 'north',
      name: 'Manifesto',
      position: { x: 0, y: -SECTION_OFFSET }, // Up/North = negative Y
      scrollStart: 1000,
      scrollEnd: 3000,
      stickyZoneSize: 1200,
      virtualContentBounds: { width: 600, height: 800 },
    },

    // East (Participants) - Right side
    {
      id: 'east',
      name: 'Participants',
      position: { x: SECTION_OFFSET * 0.8, y: 0 }, // Right = positive X (reduced offset)
      scrollStart: 3000,
      scrollEnd: 5000,
      stickyZoneSize: 1400, // Larger section with more content
      virtualContentBounds: { width: 900, height: 1000 },
    },

    // South (Events) - Bottom
    {
      id: 'south',
      name: 'Events',
      position: { x: 0, y: SECTION_OFFSET * 0.8 }, // Down/South = positive Y (reduced offset)
      scrollStart: 5000,
      scrollEnd: 7000,
      stickyZoneSize: 1200,
      virtualContentBounds: { width: 600, height: 800 },
    },

    // West (Contact) - Left side
    {
      id: 'west',
      name: 'Contact',
      position: { x: -SECTION_OFFSET, y: 0 }, // Left = negative X
      scrollStart: 7000,
      scrollEnd: 9000,
      stickyZoneSize: 1000,
      virtualContentBounds: { width: 500, height: 600 },
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

  // Interpolate between current and next section positions
  // Use easing for smoother transitions
  const easedProgress = easeInOutQuad(localProgress);

  const x = lerp(currentSection.position.x, nextSection.position.x, easedProgress);
  const y = lerp(currentSection.position.y, nextSection.position.y, easedProgress);

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
