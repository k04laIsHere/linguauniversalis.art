# Design & Refinement Plan - Phase 5 (Z-Index & Hierarchy)

## 1. Mobile Menu Close Button (Final Boss Fix)
- **Problem:** Even after z-index bumps, the burger/close button is still inaccessible on mobile. 
- **Root Cause Analysis:** The `.sidebar` (acting as the mobile menu) is likely in a different stacking context or has a `z-index` so high it swallows the header.
- **Action:** 
    - Move the `.burger` button JSX *inside* the sidebar container when on mobile, OR wrap the entire Header in a container with `z-index: 9999` and `position: relative`.
    - Ensure `.burger` color is `#000000` when the menu is open.
    - **Verification:** Auditor must successfully click the button in a Playwright script.

## 2. Menu Link Harmonization
- **Requirement:** "Project Declaration" must be styled exactly like artist sub-items.
- **Action:** 
    - Remove custom `.sidebarDeclarationLink` styles. 
    - Apply the exact class/styles used for `.sidebarNavChild`.
    - Ensure it is **Sentence case** (not uppercase).
    - Position it directly after the "Manifesto" link within the same navigation group.

## 3. Page Content: Project Declaration Button
- **Requirement:** Add the "Project Declaration" button to the Archive page itself.
- **Placement:** Under the Manifesto text, before the start of the Artworks/Collection section.
- **Style:** Minimalist button (matching the Archive aesthetic).

## 4. Subtitle Color (Gold Restoration)
- **Requirement:** Change "The Art of Creation" back to yellow/gold.
- **Action:** Update `.brandSubtitle` in `GalleryMode.module.css` to `color: #d4af37`. Leave the main title Black.

## 5. Audit Requirement
- Auditor must provide a screenshot of the Archive page showing the Declaration button before artworks.
- Auditor must provide a screenshot of the Mobile menu showing the Declaration link matching the artist links.
- Auditor must verify the "Close" interaction via browser tool.
