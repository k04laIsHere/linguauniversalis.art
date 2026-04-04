# Archive Breach: Implementation & Context

## Overview
The "Archive Breach" is an immersive entry point to the site's Gallery/Archive mode, appearing at the very start of the landing page journey (`#cave` section). It is designed as a "skylight" or "portal" in the cave's upper boundary.

## Technical Architecture

### 1. Visual Asset
- **File**: `public/assets/images/backgrounds/archive-breach.webp`
- **Nature**: Transparent .webp with its own lighting and glow. 
- **Constraint**: The asset's natural transparency must be respected. **Do not use CSS masks or box-shadows** on the container, as they cause clipping.

### 2. Positioning & Scaling (Cave.module.css)
- **Container**: `.archiveBreach` (positioned `absolute`, `z-index: 101` to stay above the flashlight shadow mask).
- **Scale**: Currently uses `clamp(800px, 80vw, 1800px)` for dynamic sizing. 
- **Mobile**: Switches to `width: 120%` and `aspect-ratio: 4/3` to act as a prominent top-header portal.
- **Offsets**: Uses viewport units (e.g., `top: 15vh`) to avoid overlapping the "Lingua Universalis" title text.

### 3. Logic & Transition (Cave.tsx)
- **Component**: `ArchiveBreach` is a clickable div within the `Cave` section.
- **Transition**: Triggers an **Iris-like animation** using GSAP. A white circle expands from the center of the breach to fill the screen before switching the `viewMode` to `gallery`.
- **Files Involved**:
  - `src/sections/Cave.tsx`: Structural logic and Iris transition.
  - `src/sections/Cave.module.css`: Layout, scaling, and typography.
  - `src/contexts/ViewModeContext.tsx`: Manages the 'immersive' vs 'gallery' state.

## Current Limitations & Known Issues
- **Inconsistent Sizing**: Across varying aspect ratios (Ultrawide vs. Tablet), the breach can still feel either too dominant or slightly misaligned with the background environment.
- **Overlay/Clipping**: Because of its massive scale, the breach container can sometimes be clipped by the browser viewport or overlap the primary "Lingua Universalis" hero text on shorter screens.
- **Centering**: The text inside the breach needs to remain mathematically centered within the "white" portion of the hole, which requires precise flexbox management as the container scales.
