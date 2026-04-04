# Header Redesign Instructions

## Objective
Redesign the header according to the user's "premium" and "functional" requirements.

## Tasks
1. **Fixed Positioning:** 
   - Move the header away from the very top. Add a margin from the top edge (e.g., `top: 24px` for `headerInner`).
   - Ensure the header stays fixed during scroll and maintains its "capsule" look.
2. **Mobile Navigation:** 
   - The **Sandwich button** (`menuToggle`) must be the primary mobile navigation element. Currently it might be hidden on small screens; ensure it is visible for `max-width: 1100px`.
   - The **Language button** (`langToggleSingle`) should be **hidden** on mobile (screen width < 1100px) to reduce clutter.
   - The **Language toggle** must be added **inside** the mobile menu overlay (`overlay` class) as a prominent, high-quality toggle.
3. **Layout Polish:** 
   - Fix overlaps between the brand title and the "View as List" button on narrow screens. Consider responsive font sizing or hiding elements if they don't fit.
   - Ensure the brand title and hint are clearly legible.
   - Maintain the "Cinzel" font and gold/white aesthetic.

## Files to edit
- `src/components/Header/Header.tsx`
- `src/components/Header/Header.module.css`

## Success Criteria
- Header has a top margin and feels like a floating capsule.
- Sandwich button is visible on mobile; language button is hidden.
- Language toggle is prominent inside the sandwich menu.
- No layout overlaps on mobile/narrow screens.
