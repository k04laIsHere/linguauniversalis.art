# Design & Refinement Plan - Phase 3

## 1. Landing Logic (Archive-First)
- **Problem:** The site still defaults to 'immersive' despite previous attempts. 
- **Solution:** Hard-reset `ViewModeContext.tsx` default state. Verify if `App.tsx` or any hash-handling logic is overriding the initial load. Ensure the root path `/` explicitly forces `gallery` mode.

## 2. Navigation Sidebar Overhaul (Archive Mode)
- **Cleanup:** Remove the redundant first "Project Declaration" button.
- **Start the Journey Button:** Replace the first action slot with "Start the Journey" (secondary style). It must trigger the black-fade transition just like the main portal.
- **Declaration Button:** Style as White background + 1px border. Positioned under "Manifesto".

## 3. The Journey Portal (Visual Hierarchy)
- **Vertical Spacing:** Increase margin-top for the philosophical intro text.
- **The "Unification" Frame:** Surround the intro text and the Journey button with a stylish, minimalist border (e.g., 1px hairline with specific padding) to create a "portal container" feel.
- **Subtitle Restoration:** Add "The Art of Creation" (localized) under the main "Lingua Universalis" title.
- **Style Injection:** Use `Inter Semibold`, `uppercase`, and the signature gold (`#d4af37`). Match the style of existing brand hints.

## 4. Mobile Fixes
- **Menu Occlusion:** Inspect the `z-index` and positioning of the mobile menu close button. Ensure no overlays or headers sit on top of it.

## 5. Dual-Stage Verification
- **Stage 1 (Local Browser):** Auditor verifies animations, borders, and spacing.
- **Stage 2 (Production Browser):** After push, auditor performs a final check on `linguauniversalis.art` to ensure CDN/Caching doesn't mask issues.
