# Archive Breach Refinement Plan - Phase 2

## Overview
Correct the positioning, scale, and interaction of the Archive Breach. Ensure it sits above the flashlight mask, is significantly larger, and features a custom iris-like transition to the Archive view.

## Tasks

### 1. Visual Scale & Positioning
- **Action:** Increase the breach container size by 3x.
- **Action:** Adjust `z-index` to ensure it sits on top of the `.shadowMask` (flashlight layer).
- **Action:** Center the text content perfectly within the breach visual.
- **Files:** `src/sections/Cave.tsx`, `src/sections/Cave.module.css`.

### 2. Interaction & Selection
- **Action:** Remove all hover animations (transform/brightness).
- **Action:** Apply `user-select: none` and `-webkit-tap-highlight-color: transparent` to prevent blue selection rectangles on Android/Mobile.
- **Files:** `src/sections/Cave.module.css`.

### 3. Iris-like Transition
- **Action:** Implement a GSAP animation that triggers on breach click.
- **Effect:** A white circular "iris" starts from the center of the breach and expands to fill the entire screen, transitioning into the Archive.
- **Files:** `src/sections/Cave.tsx`, `src/App.tsx` (if global transition overlay needs adjustment).

### 4. Verification
- **Action:** Use Playwright to capture the **start** of the journey (`#cave` section).
- **Action:** Inspect both Desktop and Mobile viewports for 3x scale and centering.
- **Action:** Verify z-index by ensuring the breach is not dimmed by the flashlight mask.

## Orchestration
I will implement the CSS/TSX changes manually to ensure the "iris" logic is robust, then verify with the browser tool.
