# Layout Polisher Instructions

## Objective
Polish the overall website layout and design to feel fast, smooth, and premium.

## Tasks
1. **Background/Backdrop Layering:**
   - Investigate why the background (Nature/Urban) is showing through in the `Team` and `Events` sections on mobile. They should have a solid matte or their own backgrounds.
   - Adjust `sectionStyles.module.css` or the individual section modules to ensure proper layering.
2. **Landing Page Balance:**
   - Ensure the "VIEW AS LIST" button, Breach text, and "LINGUA UNIVERSALIS" title are well-spaced and don't overlap on mobile (iPhone X/SE).
   - Ensure the "LINGUA UNIVERSALIS" title is the primary hero focus.
3. **General Refinement:**
   - Fix any "blue selection rectangles" on manifesto text (`user-select: none`).
   - Polish transition ease values for a more "elastic" feel.
   - Improve the visibility of the scroll hint on mobile.
4. **Files to edit:** 
   - `src/sections/Cave.module.css`
   - `src/sections/Team.module.css`
   - `src/sections/Events.module.css`
   - `src/styles/global.css`

## Success Criteria
- Sections like Team and Events are opaque and don't leak the backdrop unexpectedly.
- No layout overlaps on mobile/narrow screens.
- Smooth, fast, and premium feel to all transitions.
- High-quality, polished typography and spacing.
