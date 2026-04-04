# Website Refinement Plan - March 2026

## Overview
Address specific UX and UI issues across the landing page, cave sections, and archive to ensure a smoother, more premium experience.

## Tasks

### 1. Loader to Cave Transition (Smooth Scroll Exit)
- **Issue:** Scrolling out of the "Choice" state in the Loader results in a white screen flash before the cave abruptly appears.
- **Fix:** Ensure the transition from the Loader's background to the first Cave section is synchronized. The background should blend or transition seamlessly without white gaps.
- **Files:** `src/components/Loader/Loader.tsx`, `src/sections/Cave.tsx` (or equivalent start section).

### 2. Prevent UI Selection (Mobile/Desktop)
- **Issue:** Tapping/clicking manifesto text or paintings in Cave/Cave Art sections causes blue selection rectangles or text highlighting.
- **Fix:** Apply `user-select: none` and `-webkit-tap-highlight-color: transparent` to manifesto text and painting elements.
- **Files:** `src/sections/Cave.module.css`, `src/sections/CaveArt.module.css`.

### 3. Archive Entry (Scroll to Top)
- **Issue:** Entering the Archive (via "View as List" or "Enter Immersion") doesn't always reset the scroll position, sometimes landing the user mid-page.
- **Fix:** Force a `window.scrollTo(0, 0)` or equivalent logic upon navigating to or mounting the Archive view.
- **Files:** `src/views/ArchiveView.tsx` (or relevant route/component).

### 4. Contact Form UI (Darker Backdrop)
- **Issue:** The Signal contact form background is too light, making it feel disconnected.
- **Fix:** Darken the background color of the form container while maintaining the current backdrop-filter blur.
- **Files:** `src/components/ContactForm/ContactForm.module.css` (or equivalent).

## Orchestration Strategy
- **Agent 1:** Focus on Task 1 (Loader Transition) and Task 3 (Archive Scroll).
- **Agent 2:** Focus on Task 2 (Selection fixes) and Task 4 (Contact Form UI).
