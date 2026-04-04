# Viewport Stability Instructions

## Objective
Eliminate mobile background "jumping" and "blinking" in transitions.

## Tasks
1. **Stable Viewport Units:** 
   - Replace all instances of `100vh` in `App.tsx`, `Events.tsx`, `ExitFlight.tsx`, and `Cave.tsx` with `dvh` (Dynamic Viewport Height) or implement a stable CSS variable `--vh` that only updates on orientation change (width change).
   - **Critically:** Remove the `updateHeight` and `lockHeight` listeners in `ExitFlight.tsx` and `Events.tsx` that call `ScrollTrigger.refresh()` on every resize. This is causing the blinking and masking issues.
2. **Exit Flight Mask Stability:**
   - Fix the issue where the `cave-arch-mask` in `ExitFlight` moves up when the address bar hides. It should remain pinned relative to the stable viewport.
   - Ensure the "valley" background (`exitFill`) remains properly covered until the transition's intended zoom occurs.
   - Consider setting the mask to `fixed` or using a more stable transform origin.
3. **Blink Suppression:** 
   - Optimize the GSAP timelines in `ExitFlight` and `Events` to prevent flashes/re-renders on scroll.
   - Use `anticipatePin: 1` and `invalidateOnRefresh: true` for ScrollTriggers.

## Files to edit
- `src/App.tsx`
- `src/sections/ExitFlight.tsx`
- `src/sections/Events.tsx`
- `src/sections/Cave.tsx`
- `src/styles/global.css`

## Success Criteria
- No "jumping" of backgrounds when the address bar hides/shows on mobile.
- No "blinking" or flashing in the Events or Exit Flight sections.
- The cave-arch-mask is vertically stable and never reveals the background prematurely.
- Smooth, fast transitions throughout.
