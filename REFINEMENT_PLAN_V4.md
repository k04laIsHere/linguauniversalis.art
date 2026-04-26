# Design & Refinement Plan - Phase 4 (Stabilization)

## 1. Landing Logic (Hard-Archive Default)
- **Status:** Previous attempts failed to stick. 
- **Action:** 
    - Hard-code `ViewModeContext.tsx` default state to `gallery`.
    - Modify `App.tsx` or `I18nProvider.tsx` (wherever initial load is handled) to check `window.location.pathname` and force-set mode to `gallery` if no hash is present.
    - **Verification:** Agent MUST take a screenshot of root URL and verify it's the white Archive background.

## 2. Branding Typography (Monochrome)
- **Requirement:** Main Title + "The Art of Creation" subtitle must be BLACK.
- **Action:** Remove gold (#d4af37) from `.brandSubtitle` in `GalleryMode.module.css`. Set to `#1a1a1a`.

## 3. Vertical Rhythm & Spacing
- **Requirement:** Move the "Unified Portal Container" (Intro + Button) HIGHER.
- **Action:** Decrease `margin-top` on the `.portalFrame` in `GalleryMode.module.css`. 

## 4. Navigation & Declaration Sidebar
- **Requirement:** Bring back "Project Declaration" under "Manifesto". Make it "even more in line".
- **Action:** 
    - Restore the button in `GalleryMode.tsx`. 
    - **Mobile:** Style it exactly like an Artist link (no border, same font-size/padding).
    - **Sidebar (Desktop):** Keep it minimalist under Manifesto.
    - **Spacing:** Add `margin-bottom` to the "Start the Journey" button in mobile nav to separate it from artist links.

## 5. Mobile Menu Occlusion (Root Cause Fix)
- **Problem:** Burger 'Close' button hidden behind white sidebar/overlay.
- **Root Cause Analysis:** Likely the sidebar `transform: translateX` overlaying the fixed header's burger button, or a `z-index` conflict where the header is lower than the mobile sidebar container.
- **Action:** Move the burger button JSX into a dedicated container with `z-index: 9999` or ensure the header stays atop the sidebar during open state.

## 6. Audit Requirement
- Auditor must use the browser to **see** the 'X' button in the top right. 
- Auditor must verify the Landing screenshot is not black.
