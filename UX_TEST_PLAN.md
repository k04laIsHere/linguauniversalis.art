# Lingua Universalis: UI Test Resources & Inspection Guide

This document defines the inspection points and behavioral expectations for the Lingua Universalis website. It is designed for an agentic model to perform automated or semi-automated verification of the site's state, UX, and theme consistency.

## Site Metadata
- **URL**: `http://localhost:5173/`
- **Theme**: Ancient/Future, Cave/Nature/Urban, Discovery-based navigation.
- **Key Tech**: React, GSAP (ScrollTrigger), CSS Masks (Flashlight).

---

## 1. Global UI & Experience Tests

### G1. Discovery Navigation
- **Goal**: Verify the "non-interface" navigation principle.
- **Action**: Locate the header logo and menu toggle.
- **Expectation**: Clicking the menu toggle should reveal a full-screen blurred overlay. Standard top navbars should be avoided when not in "scrolled" mode.
- **Verification**: Check if the overlay covers the viewport and if navigation buttons work (smooth scroll).

### G2. Flashlight & Immersion
- **Goal**: Ensure the primary interaction metaphor works.
- **Action**: Move the pointer across the screen.
- **Expectation**: The `--lu_x` and `--lu_y` CSS variables on `:root` or the section should update. The mask (radial gradient) should follow the cursor.
- **Verification**: Inspect the `mask-image` property of the `.shadowMask` in the Cave section.

### G3. Ambient Whispers
- **Goal**: Verify the "whisper" system for thematic depth.
- **Action**: Stay on any section for 10-20 seconds.
- **Expectation**: Phrases like "Art must be pure" should fade in and out at random positions.
- **Verification**: Locate elements with `class*="whisper"` in the DOM.

---

## 2. Section-Specific Tests

### S1. The Cave (#cave)
- **Visuals**: Dark cave wall, title, manifesto, 4 artifact images.
- **Interaction**: Artifacts should fade in as the user scrolls through the "ancient" pinned field.
- **Immersion**: Text should be readable only where the flashlight shines (high contrast mask).

### S2. Exit Flight (#exitFlight)
- **Animation**: Pinned "Z-axis" flight.
- **Action**: Scrub scroll through the section.
- **Expectation**: The "cave edges" should scale up (camera push) and the "exit landscape" should fade in and fly forward.
- **Immersion**: Transition from darkness to the valley backdrop.

### S3. Team & Events (#team, #events)
- **Animation**: Cards flying through the center of the screen.
- **Action**: Scrub scroll.
- **Expectation**: The left-side list items should update their "active" status as corresponding cards move into focus.
- **Verification**: Look for `Active` class names on list items.

### S4. Nature → Urban Transition (#natureUrban)
- **Goal**: Verify the cinematic shift.
- **Action**: Scroll into the pinned beat between the valley and the city.
- **Expectation**: A static noise/glitch effect should appear. The background should crossfade from the Valley (NatureBackdrop) to the Skyscraper (UrbanBackdrop).
- **Verification**: Monitor the `opacity` of `#natureBackdrop` and `#urbanBackdrop`.

### S5. The Gallery (#gallery)
- **Layout**: Masonry (organic) grid.
- **Features**: Search, Filter, Sort, Lightbox.
- **Interaction**: Clicking a card opens a detailed view (Lightbox).
- **UX**: Search should update the grid in real-time. Hovering over cards should reveal metadata (artist/title) with a blur effect.

### S6. Contact (#contact)
- **Interaction**: "Signal" charge.
- **Action**: Mouse down (long press) on the "Signal" button.
- **Expectation**: A progress bar or variable (`--p`) should fill up. After ~2 seconds, the contact details (Email, Telegram) should be revealed.
- **Verification**: Ensure the `mailto:` and Telegram links are present after the "charge" completes.

---

## 3. Transition & Flow Tests

### T1. Background Continuity
- **Goal**: Ensure backdrops transition smoothly without flickering.
- **Verification**: 
    - At `#cave`: No backdrop (black).
    - At `#exitFlight`: `#natureBackdrop` fades in.
    - At `#team` & `#events`: `#natureBackdrop` stays at `opacity: 1`.
    - At `#natureUrban`: `#natureBackdrop` fades out, `#urbanBackdrop` fades in.
    - At `#gallery` & `#contact`: `#urbanBackdrop` stays at `opacity: 1`.

### T2. Pinned Scene Synchronization
- **Goal**: Verify that GSAP pinning doesn't break the layout flow.
- **Verification**: Check if the section headers and "Scroll" hints stay in the viewport while the background animations scrub.

### T3. Navigation Anchors
- **Goal**: Ensure smooth-scroll utility lands accurately.
- **Verification**: Use the Header menu to jump between `Ancient` and `Contact`. Ensure the destination section is correctly positioned in the viewport after the scroll finishes.

---

## 4. Thematic Inspection Prompts

Use these prompts to guide an AI agent in evaluating the site's "soul":
1. "Does the transition from the Cave to the Valley feel like a physical emergence or just a page scroll?"
2. "Are the 'Whispers' too intrusive, or do they feel like genuine echoes of the manifesto?"
3. "Does the Gallery grid feel 'grown' (organic) or 'calculated' (rigid)? How can we make it feel more like an eroded stone wall of art?"
4. "Is the Flashlight effect enhancing the mystery, or is it frustrating the user's ability to read content?"

