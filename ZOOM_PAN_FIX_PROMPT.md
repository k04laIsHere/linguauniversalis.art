# Zoom/Pan Mechanics Fix - Complete Agent Prompt

## Current Status

**Working:**
- ✅ Panning direction is CORRECT (moving mouse right translates content left, revealing right side)
- ✅ Dynamic origin is implemented at mouse cursor position

**Broken:**
- ❌ Zoom-to-Point is NOT working - it zooms to hero section (center) instead of keeping the target content under the mouse cursor
- ❌ The point under the cursor does NOT stay fixed during zoom

## Core Requirements (MUST HAVE)

1. **Zoom-to-Point (Google Maps Style)**
   - When user scrolls to zoom in, the point on the map directly under the mouse cursor MUST remain under the cursor throughout the zoom transition
   - If user points at "Contacts" section on the left and scrolls up to zoom in, "Contacts" should expand but stay exactly under the pointer
   - This is the PRIMARY issue that needs fixing

2. **Panning Direction (MUST NOT BREAK)**
   - ✅ Currently working correctly: Moving mouse RIGHT → Content moves LEFT → User sees RIGHT side
   - DO NOT invert this behavior - it's correct as is
   - Panning speed should follow bell curve: fastest at 50% zoom (0.3), slowest at zoom in/out (0.05)

3. **Zoom Speed Curve (Bell Curve)**
   - Panning speed should be greatest at 50% zoom (mid-level)
   - Panning speed should be lowest at high zoom in (for precision) and low zoom out (for stability)
   - Current formula: `speedMin + (speedMax - speedMin) * 4 * p * (1 - p)` where speedMin=0.05, speedMax=0.3

4. **Minimal Pan When Zoomed In**
   - When fully zoomed in (p=0), panning should be minimal (0.05 speed) for precision

5. **Mobile Support**
   - On mobile, camera must zoom in to touch location (finger position), not center
   - Same zoom-to-point logic should apply for touch interactions

6. **No Content Shift Issues**
   - Content should NOT drift to lower-right corner
   - Camera should NOT jump back to center during zoom
   - No inversion issues

## Technical Context

**File:** `src/App.jsx`

**Current Implementation:**
- Dynamic `transformOrigin` at mouse cursor: `${(mouseX - centerX)}px ${(mouseY - centerY)}px`
- Translation formula: `originCompensation + panTranslation`
  - `originCompensation = -mouseOffset * (1 - scale)`
  - `panTranslation = (center - mouse) * panSpeed`
- Scale range: `startScale` (0.85) to 0.15 based on progress `p` (0 = zoomed in, 1 = zoomed out)
- Element is centered at viewport center with `transform-origin` at mouse position

**Problem Analysis:**
The dynamic origin is set correctly, but the zoom-to-point compensation is wrong. When zooming, the point under the cursor should stay fixed, but currently it drifts toward the center (hero section).

## Mathematical Requirements

**Zoom-to-Point Logic:**
- World point at position `P_world` should appear at screen position `mousePos`
- When scale changes from `s1` to `s2`, the translation `T` must satisfy:
  - `mousePos = P_world * s2 + T`
  - Since `mousePos = P_world * s1 + T1` (current state)
  - `T = mousePos - P_world * s2 = mousePos - (mousePos - T1) / s1 * s2`
  - Simplified: `T = mousePos * (1 - s2/s1) + T1 * (s2/s1)`

**Panning Logic (DO NOT CHANGE - Currently Correct):**
- Mouse right → See right → Content moves LEFT → Translation: `(center - mouse) * panSpeed`
- This gives negative translation when mouse is right of center (correct)

## Error Patterns to Avoid

1. ❌ **DO NOT** invert panning direction - it's currently correct
2. ❌ **DO NOT** cause content to shift to lower-right corner
3. ❌ **DO NOT** make camera jump to center during zoom
4. ❌ **DO NOT** use formulas that cause inversion at zoom out
5. ❌ **DO NOT** break mobile zoom-to-point

## Solution Approach

**Key Insight:** The dynamic origin at mouse handles zoom-to-point automatically, BUT the translation compensation might be interfering. The origin shift compensation might be too aggressive or wrong.

**Possible Solutions to Explore:**
1. Verify dynamic origin coordinates are correct relative to element center
2. Adjust origin shift compensation formula
3. Consider if translation needs to work differently with dynamic origin
4. Ensure zoom compensation properly accounts for the point under cursor staying fixed

## Verification Checklist

Before pushing, verify:
- [ ] Point under mouse cursor stays fixed during zoom (like Google Maps)
- [ ] Panning direction still correct (mouse right → see right)
- [ ] Panning speed follows bell curve (fastest at mid-zoom)
- [ ] Minimal pan when fully zoomed in
- [ ] Mobile zoom works to touch location
- [ ] No content shifting to corners
- [ ] No camera jumping to center
- [ ] No inversion issues

## Questions to Ask User (If Uncertain)

1. When you point at a section (e.g., "Contacts" on left) and zoom in, does it stay under cursor or drift to center?
2. Is panning direction still correct after changes?
3. Does the zoom feel smooth and natural?

## Action Items

1. **Analyze** the current zoom-to-point compensation formula
2. **Rethink** the logic from ground up - why is zoom going to center instead of mouse cursor?
3. **Fix** the zoom-to-point implementation while preserving correct panning
4. **Test** all requirements in the checklist above
5. **Ask** clarifying questions if anything is ambiguous
6. **Push** to main branch only after all requirements are met

## Expected User Flow (Correct Behavior)

1. User scrolls up → Camera zooms out → User sees overview
2. User moves cursor to upper sections → Camera pans there → Section moves closer to middle
3. Section is now almost in center of user screen
4. User scrolls down → Camera zooms IN on the section under cursor (NOT hero/center)
5. While zooming, the target element stays fixed under mouse cursor
6. User continues scrolling → Upper section takes most of screen, with targeted element still under cursor
7. When zoomed in, panning by moving cursor is minimal (just visual effect, not navigation)

## Code Location

The camera logic is in `src/App.jsx` starting around line 324:
- `desktopCameraX` and `desktopCameraY` functions
- `mobileCameraX` and `mobileCameraY` functions  
- `originX` and `originY` transform origins
- The motion.div style that applies these transforms

## Critical Constraint

**DO NOT change panning behavior** - it's currently working correctly. Only fix the zoom-to-point issue.












