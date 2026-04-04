# Archive Breach Refactor Plan - March 2026

## Overview
Remove the initial mode choice and transition the landing page into a direct immersive experience. Implement a "breach" in the cave's upper boundary that serves as a visual and narrative entry point to the Archive.

## Tasks

### 1. Asset Integration
- **Action:** Move `archiveEntrance.webp` from Downloads to the project's public assets.
- **Path:** `public/assets/images/backgrounds/archive-breach.webp`

### 2. Remove Mode Choice UI
- **Action:** Modify the `Loader` component to skip the "Enter Immersion / View as List" selection.
- **Goal:** Users land directly in the `Cave` section after loading.
- **Files:** `src/components/Loader/Loader.tsx`, `src/components/Loader/Loader.module.css`.

### 3. Title Refinement
- **Action:** Reduce the font size of the "Lingua Universalis" title at the start of the journey to feel more integrated and less like a splash screen.
- **Files:** `src/sections/Cave.module.css` (or relevant title component).

### 4. Implement Archive Breach (Desktop & Mobile)
- **Action:** Create a new `ArchiveBreach` component (or integrate into `Cave`) positioned in the top right (desktop) or top (mobile).
- **Visuals:** Use `archive-breach.webp` as a mask or background for a "breach into light."
- **Content:** Thoughtfully arrange the text: "Archive. Direct access to the results. View the portfolio and curated artifacts."
- **Interaction:** Clicking/tapping the breach navigates the user to the Archive view.
- **Files:** `src/components/ArchiveBreach/`, `src/sections/Cave.tsx`.

### 5. Verification & Orchestration
- **Step 1:** Implement Task 1 & 2 (Immediate landing).
- **Step 2:** Implement Task 3 & 4 (Visual breach).
- **Step 3:** Inspect mobile and desktop viewports using Playwright screenshots.
- **Step 4:** Refine layout and typography for "beautiful and thoughtful" arrangement.
- **Step 5:** Final push to `main`.

## Orchestration
I will spawn sub-agents to handle the implementation and verification phases to ensure precision.
