# Archive Breach Refinement Plan - Phase 3

## Overview
Correct the sizing, layer ordering, and typography of the Archive Breach based on `breachScreenshot.png`. Ensure it is significantly larger, sits above the flashlight mask, and uses centered black text.

## Tasks

### 1. Scaling & Visibility
- **Scale:** Increase the breach width and height further (aiming for ~3x larger than current).
- **Z-Index:** Verify and fix the layer stack. It must be above `.shadowMask` (z-index 3).
- **Overflow:** Ensure it is not clipped by the section boundaries or parent containers.

### 2. Typography & Centering
- **Text Color:** Change breach text to `#000000` (black) for better contrast against the "light" of the breach.
- **Fitting:** Ensure all text fits comfortably inside the visible "hole" of the breach.
- **Alignment:** Robust centering within the breach visual.

### 3. Verification Strategy
- **Target:** Capture the **Hero/Title** screen (Start of journey).
- **Checkpoints:** 
  - Is the breach bright even without the flashlight? (Confirms z-index)
  - Is the text black and centered?
  - Does it look significantly larger and un-clipped?

## Orchestration
I will apply the CSS/TSX fixes and then run a verification capture.
