# Lingua Universalis — Current Implementation Description

This document describes the **current version** of the Lingua Universalis website in this repo: architecture, data flow, how each section behaves (including animations), and known bugs.

> Scope note: This describes the site as implemented in `src/` at the time this file was written.

---

## Architecture overview

### Tech stack
- **Vite + React + TypeScript** single-page app
- **GSAP + ScrollTrigger** for pinned scroll scenes and scrubbed timelines
- **CSS Modules** for component styling, plus `src/styles/global.css` for global variables/utility classes
- **Static assets** served from `public/assets/*`

### Runtime structure
- Entry: `src/main.tsx` mounts React into `#root`
- Top-level composition: `src/App.tsx`
  - `I18nProvider` wraps the whole app
  - `Header` is fixed and always visible
  - Background “backdrops” are fixed positioned layers behind the content:
    - `NatureBackdrop` (valley)
    - `UrbanBackdrop` (skyscraper)
  - `<main>` renders the sequence of sections (Cave → ExitFlight → Team → Events → Nature→Urban → Gallery → Contact)

### Content / i18n
- Language state is stored in `localStorage` (default RU) and exposed via context:
  - `src/i18n/I18nProvider.tsx`
  - `src/i18n/useI18n.ts`
- Dictionaries:
  - `src/content/ru.ts`
  - `src/content/en.ts`
- Team and events data:
  - `src/content/teamData.ts`
  - `src/content/eventsData.ts`
- Gallery manifest data:
  - `src/content/galleryManifest.ts`

### Navigation / section IDs
`Header` renders buttons that smooth-scroll to element IDs using `scrollIntoView`:
- Implemented in `src/components/Header/Header.tsx`
- Smooth scroll helper: `src/utils/scroll.ts`
- IDs used as anchors:
  - `#cave`
  - `#manifesto`
  - `#ancient` (artifact field inside Cave; do not duplicate this ID elsewhere)
  - `#exitFlight`
  - `#team`
  - `#events`
  - `#natureUrban`
  - `#gallery`
  - `#contact`

### Background layering model (important)
Backdrops are **fixed** (`position: fixed; inset: 0; z-index: -1`) and content sections are drawn on top.

- **NatureBackdrop** (valley): `src/components/Backdrops/NatureBackdrop.tsx`
  - Shows the `valley-distance.jpg` background.
  - Controlled by `src/components/Backdrops/BackdropController.tsx` (ScrollTrigger).
  - Intended to remain visible through ExitFlight → Team → Events, then fade out at Nature→Urban.

- **UrbanBackdrop** (skyscraper): `src/components/Backdrops/UrbanBackdrop.tsx` + `.module.css`
  - Shows `skyscraper-rooftop.jpg`.
  - It is a fixed element with id `urbanBackdrop` and is animated by `src/components/Backdrops/BackdropController.tsx`.
  - Gallery and Contact are set to **transparent** backgrounds to “scroll on top” of it.

---

## Global styling utilities

### Typography and color
- Global CSS variables and fonts: `src/styles/global.css`
  - `--accent` controls the gold accent color.
  - `--font-title` is used for headings (Cinzel), `--font-body` for body (Inter).

### Rectangular feather mask (images)
- Global utility class: `.featherRect` in `src/styles/global.css`
  - Applied to **Ancient artifacts**, **Team photos**, and **Events images**.
  - Not applied to Gallery thumbnails (Gallery requested no edge blur).

---

## Section-by-section behavior

## 1) Header (persistent)
Files:
- `src/components/Header/Header.tsx`
- `src/components/Header/Header.module.css`
- `src/components/Header/useActiveSection.ts`

How it works:
- Fixed at the top with a semi-transparent gradient background.
- Renders nav buttons for each section id.
- Language toggle (RU/EN) updates i18n context and persists to `localStorage`.
- Active section highlighting is driven by `useActiveSection` (IntersectionObserver-style logic).

---

## 2) Cave (title + manifesto + flashlight + pinned artifact gallery)
Files:
- `src/sections/Cave.tsx`
- `src/sections/Cave.module.css`

Visual layers:
- `.bg`: cave wall texture (`cave-wall-texture.jpg`)
- `.vignette`: dark vignette overlay
- `.shadowMask`: the “flashlight darkness” overlay using a radial-gradient **mask**

Flashlight behavior:
- JS listens to pointer movement and writes CSS variables on the root section:
  - `--lu_x`, `--lu_y` (in %)
  - `--lu_r` (radius in px)
- The flashlight effect is implemented by `.shadowMask`:
  - It’s a mostly-black overlay whose mask becomes transparent inside a circular region (light cone).

Manifesto:
- Title + subtitle + manifesto list are static content from i18n dictionaries.
- `#manifesto` anchor exists inside the cave content.

Cave “gallery” / artifacts (current implementation):
- Implemented as a **scattered field** of 4 large images inside the Cave section:
  - container: `#ancient` (the anchor used by the header)
  - individual items: `div[data-artifact="1"]`
- Each artifact contains:
  - image `assets/art/art-N.jpg` (with `.featherRect`)
  - centered title/subtitle text (currently placeholders like “PALEOLITHIC ECHO”)

Pinned scroll “lock”:
- `ScrollTrigger` pins the `#ancient` field for `+=220%` scroll distance.
- While pinned, a GSAP timeline animates the artifacts:
  - initial opacity/y
  - per-artifact fade-in
  - slight drift
- While pinned, a CSS class `cavePinned` is toggled on the Cave root.
  - In CSS, when `.cavePinned` is present, `.bg/.vignette/.shadowMask` become `position: fixed`
  - This is meant to avoid the feeling of “only the scrollbar moves”.

Responsive behavior:
- On mobile (`max-width: 860px`), artifacts become a stacked centered list (no absolute positioning).

---

## 3) ExitFlight (cave exit pin + Z-like flight + edge-only flashlight)
Files:
- `src/sections/ExitFlight.tsx`
- `src/sections/ExitFlight.module.css`

Purpose:
- A pinned scrubbed scene where cave edges scale up (camera push) and exit landscape flies forward and fades.

Layers:
- `.baseDark` (black base): provides “black at start” before the exit landscape fades in.
- `.exitFill` (`cave-exit-landscape.png`):
  - Starts at opacity 0.
  - Fades in during the timeline (currently at ~12% progress).
  - Scales and then flies forward + fades out.
- `.caveEdges` (`cave-arch-mask.png`):
  - Scales up as the “camera” moves into the cave opening.
  - Fades out later in the timeline.
- `.edgesLightMask`:
  - A darkness overlay with a radial “light hole” mask, tracking pointer.
  - It sits above the exitFill, so the flashlight affects **only the cave edges layer**.
  - It fades out near the end of the timeline, so outside the cave it becomes fully gone.

Pointer tracking:
- Similar to Cave: JS sets `--lu_x/--lu_y/--lu_r` on the section root.
- CSS uses those variables for `.edgesLightMask`.

Background behind:
- The valley itself is provided by **NatureBackdrop** (fixed).
- ExitFlight also has `.baseDark` to force black at the very start.

---

## 4) Team (pinned fly-through + always-visible list)
Files:
- `src/sections/Team.tsx`
- `src/sections/Team.module.css`

Layout:
- Pinned section with:
  - left list of creators (always visible; scrollable if too tall)
  - fly-through images in the center (one at a time in practice)

Animation:
- GSAP timeline with ScrollTrigger scrubbing:
  - Each team image (`[data-team-card="1"]`) is positioned in 3D space and animated:
    - appear → approach (z to 0, scale to 1) → pass (z large, scale large, opacity 0)
- Active list item highlight:
  - Determined via `onUpdate` of ScrollTrigger.
  - Applies/removes `styles.listItemActive` on list items (`[data-team-li="1"]`) directly.

Important dependency:
- Background behind team is expected to be **NatureBackdrop** (valley), not section-local images.

---

## 5) Events (pinned fly-through + static info panel)
Files:
- `src/sections/Events.tsx`
- `src/sections/Events.module.css`

Layout:
- Top-left (desktop) info panel shows:
  - section title
  - active event title + description (changes as the timeline progresses)
- Only event images fly-through (no event text on cards)

Animation:
- Similar fly-through timeline as Team for `[data-event="1"]` elements.
- Active event index is derived from ScrollTrigger progress.

Background:
- Same expectation as Team: **NatureBackdrop** supplies valley behind the scene.

---

## 6) Nature → Urban (pinned beat that fades in UrbanBackdrop)
Files:
- `src/sections/NatureUrbanPlaceholder.tsx`
- `src/sections/NatureUrbanPlaceholder.module.css`

Current behavior:
- A pinned “beat” section with UI copy.
- It does **not** render its own skyscraper image; instead it manipulates the fixed `#urbanBackdrop`:
  - During the pinned scroll, it fades `#urbanBackdrop` to opacity 1.
  - Scrubbed so it reverses when scrolling back.

This avoids the “double skyscraper background” problem.

---

## 7) Gallery (manager-first browsing)
Files:
- `src/sections/Gallery.tsx`
- `src/sections/Gallery.module.css`
- `src/components/GalleryLightbox/GalleryLightbox.tsx`

Core features:
- Search (normalized text)
- Filter by artist
- Sort
- Count display
- Click card opens lightbox

Deep-linking:
- Hash format: `#gallery?work=<id>`
- The gallery listens to `hashchange` and opens the matching work.

Background:
- Gallery section background is `transparent` so the fixed **UrbanBackdrop** shows through.

Images:
- Gallery thumbnails are **not** masked (per request).

---

## 8) Contact (“Signal” interaction)
Files:
- `src/sections/Contact.tsx`
- `src/sections/Contact.module.css`
- `src/content/contactData.ts`

Behavior:
- Press-and-hold to “charge” a signal:
  - progress drives CSS variable `--p`
  - after reaching 1, reveals contact channels
- Channels:
  - Email: mailto + copy
  - Telegram: open link + copy
- Copy uses `navigator.clipboard` with a prompt fallback.

Background:
- Contact section background is `transparent` so it also scrolls over **UrbanBackdrop**.

---


---

## How to run
- Dev:
  - `npm run dev`
  - Local: `http://127.0.0.1:5173/`
- Production build:
  - `npm run build`
  - Output: `dist/`


