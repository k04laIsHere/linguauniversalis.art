# Complete Navigation System Refactor Prompt

**Role:** Senior Creative Frontend Engineer (React, Framer Motion, Canvas).

**Project Context:**
- **Project:** Lingua Universalis website - A cinematic single-page art exhibition site
- **Tech Stack:** React 18.2.0, Framer Motion 10.12.16, Vite 5.0.0, Tailwind CSS 3.4.7, Lucide React
- **Current State:** The site uses a spatial canvas with edge-panning navigation (RTS-style free-roam)
- **Location:** `src/App.jsx` contains the main application logic
- **Content:** Managed in `src/data/content.js` with Russian/English translations
- **Sections:** Center (Title), North (Manifesto), East (Participants), South (Events), West (Contact)
- **Current Navigation:** Mouse edge-panning with flashlight/torch effect using noise layer mask

---

## Task 1: Hybrid Navigation System (Balancing Avant-Garde with Accessibility)

**The Problem:** The current "Edge-Panning" logic is too difficult for non-gamers and older users. Users feel lost.

**The Solution:** Implement a "Hybrid Navigation System" that supports both free exploration and linear guidance.

### 1. New Interaction Logic: "The Golden Path"
Keep the Spatial Canvas, but change how we move through it.
* **Primary Input (Scroll):** Map the scroll wheel to a linear path through the content sections.
    * *Scroll Down:* Smoothly fly the camera from Center -> Manifesto -> Characters -> Events -> Contact. (up and then circle motion around the canvas)
    * *Scroll Up:* Reverse the path.
    * *Feel:* This ensures that if a user just scrolls (standard behavior), they will see everything.
* **Secondary Input (Mouse Edge):** Keep the edge-panning.
* **Visual Cues (The Wind):** Add a subtle particle effect (faint sparks or dust) that flows from the center toward the next logical section, guiding the eye.

### 2. The "Compass" (Fixed UI)
Create a minimalist navigation element fixed to the bottom-right of the screen (there is one now, but this one must be visible at all times).
* **Design:** A small constellation of 5 dots (representing the 5 sections). The current section's dot glows.
* **Interaction:** Clicking a dot animates the camera/flashlight to that section along the 'golden path'.
* **Why:** This gives users a "Safety Net" if they get lost in the cave.

### 3. Accessibility Toggle ("Read Mode")
* Add a subtle text button in the top-right corner: "Plain Text" (or an Eye icon).
* **Logic:**
    * If clicked, the 3D Canvas/Flashlight fades out.
    * The content renders in a standard, vertical scroll layout (high contrast, large serif font).
    * This is crucial for screen readers and older users.

### 4. Technical Implementation
* **State:** Add `currentSectionIndex` to manage the scroll path.
* **Animation:** Use `framer-motion` to interpolate between the defined coordinates of the sections when scrolling.

---

## Task 2: Refactor to Guided Cyclic Path Experience

**Update Task:** Refine the navigation logic to move from free-roam RTS style to a "Guided Cyclic Path" experience.

### 1. The Golden Path (Scroll Physics & Logic)

**Current State:** Linear scroll (0->1->2). **New Requirement:** A Cyclic, Continuous Loop.

**The Route:** The path must flow: Center (Start) -> Bottom -> Right -> Top -> Left -> Center (End/Loop).

**Scroll Resolution:** Increase the scroll distance significantly. It should not be "1 scroll click = 1 section." It should feel like a long journey. Implement at least 16 interpolation points (waypoints) along this route so the camera moves smoothly and slowly between sections.

**Cyclic Logic:** The scroll is infinite. Reaching the end (Center) seamlessly resets or continues the loop.

### 2. Mobile Interaction (The "Auto-Guide")

**Change:** Remove touch-drag panning entirely. Mobile navigation is now controlled 100% by scrolling.

**Flashlight Logic (Mobile & Scroll Mode):**

The Flashlight is no longer tied to the finger position.

As the user scrolls, the Flashlight should automatically calculate the vector toward the next closest section.

**Visual Effect:** It acts like a spotlight guiding the user. It shines in the direction of upcoming section before the camera arrives there. Once the camera passes a section, the light smoothly rotates to point to the next one.

### 3. Desktop Interaction (Hover & Thresholds)

**Change:** Refine the Mouse Edge Panning.

**The Threshold Line:** Render a faintly visible, dashed rounded rectangular border on the screen.

**Inside the line:** The mouse controls the Flashlight freely. The camera is static.

**Outside the line:** The camera pans in that direction.

It's location must be accurate, the panning must start right at this line.

**Flashlight Logic (Desktop):**

**Default:** Flashlight follows Mouse Cursor.

**Exception:** When the user clicks the Compass (see below), the Flashlight detaches from the mouse and smoothly animates to illuminate the target section. Once the camera settles, the Flashlight animates back to the mouse cursor.

### 4. The Compass UI (Redesign)

**Location:** Bottom center, positioned above the bottom "dashed threshold line" so it doesn't trigger panning. 

**Layout:**

**Shape:** A "Cross" layout (like a D-Pad or Map).

**Center Dot (Title).**

**Top, Bottom, Left, Right Dots (The Sections).**

**Visuals:**

Dots should be 2x larger than current.

Draw a thin, elegant ring/circle connecting the 4 outer dots (Top, Right, Bottom, Left).

**Interaction:** Clicking a dot triggers a smooth "Autopilot" scroll to that point on the Golden Path.

### 5. Implementation Strategy (Technical)

**State Management:** Introduce a mode state: `controlMode = 'manual' (mouse) | 'auto' (scroll/compass)`.

**Math:** You will need to interpolate the coordinate path.

**Path:** `[(0,0), (0, 1000), (1000, 0), (0, -1000), (-1000, 0), (0,0)]`.

Use `useTransform` or a custom interpolation function to map the scrollY progress to these X/Y coordinates.

---

## Implementation Notes

### Current Code Structure:
- **Main Component:** `src/App.jsx` - Contains all navigation logic, components, and state
- **Constants:** `SECTION_OFFSET = 1500` - Distance of sections from center
- **Sections Layout:**
  - Center: (0, 0) - Title
  - North/Top: (0, -SECTION_OFFSET) - Manifesto
  - East/Right: (SECTION_OFFSET * 0.8, 0) - Participants
  - South/Bottom: (0, SECTION_OFFSET * 0.8) - Events
  - West/Left: (-SECTION_OFFSET, 0) - Contact

### Key Components to Modify/Create:
1. **NoiseLayer** - Flashlight effect (already exists)
2. **Compass** - Needs redesign to D-Pad style
3. **ThresholdBorder** - New component for desktop threshold visualization
4. **NavigationCompass** - New component with clickable dots
5. **Read Mode Layout** - New accessibility mode
6. **WindParticles** - New visual guidance component

### Dependencies:
- `framer-motion` for animations
- `lucide-react` for icons (Eye, EyeOff, Globe, etc.)
- React hooks: `useState`, `useEffect`, `useRef`, `useCallback`
- Framer Motion: `useTransform`, `useSpring`, `useMotionValue`, `useMotionTemplate`, `AnimatePresence`

### Important Considerations:
- Ensure all hooks and transforms are declared before use to avoid initialization errors
- Maintain smooth animations using spring physics
- Support both mobile and desktop interactions
- Preserve existing edge-panning as secondary input on desktop
- Ensure accessibility with Read Mode
- Make the cyclic path feel like a journey, not instant jumps

---

## Action Items

1. Implement scroll-based linear path navigation (Task 1)
2. Add Compass with clickable dots (Task 1)
3. Add Read Mode toggle and layout (Task 1)
4. Add particle effects for visual guidance (Task 1)
5. Refactor to cyclic path with 16+ waypoints (Task 2)
6. Remove mobile touch-drag, make 100% scroll-controlled (Task 2)
7. Implement auto-flashlight for mobile (Task 2)
8. Add threshold border visualization for desktop (Task 2)
9. Redesign Compass to D-Pad style (Task 2)
10. Add controlMode state management (Task 2)
11. Implement flashlight detachment logic for compass clicks (Task 2)

**After completion:** Test thoroughly and push changes to main branch.


