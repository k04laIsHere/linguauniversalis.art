# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Dual-Mode Architecture**: Implemented "Prism" navigation system for two distinct user experiences
  - ViewModeContext with localStorage persistence ('immersive' | 'gallery' modes)
  - PrismNavigation component - split-screen overlay at Cave Exit
  - GalleryMode component - minimalist white gallery view
- **Gallery Mode**: Complete "White Cube" gallery layout
  - Minimalist header with sticky positioning
  - Manifesto section with large serif typography
  - **Author pinning on desktop**: Artist column pins while scrolling through their works
    - GSAP ScrollTrigger with `pin: artistCol` - pins only the column, not the whole page
    - Adaptive scroll distance based on number of works (80vh per work)
    - Works animate in/out as you scroll through the pinned section
    - Scroll up from first artist returns to manifesto
  - **Mobile experience**: Sticky artist name header
    - Artist name stays at top of screen when scrolling their works
    - Clean white background with subtle blur
    - Works animate in as they enter viewport
  - Minimalist contact form with border-bottom inputs
- **Navigation Enhancements**:
  - "View as List" button in Header (immersive mode only)
  - "Enter Immersion" button in GalleryMode header
- **Mode Transitions**: 0.5s white fade-out/fade-in animation between modes
- **Lazy Loading**: Images in GalleryMode load lazily for better performance

### Changed
- **Team section**: Removed blurred edge effect on member photos (mask-image)
- **Team section**: Added thin border around photos consistent with site design
- **Vite config**: Added ngrok domains to allowedHosts for remote development
- **App Architecture**: Conditional rendering based on view mode (preserves existing immersive experience)
- **Gallery Mode**: Refactored scroll orchestration
  - Desktop: GSAP pinning of artist column only (not whole page)
  - Mobile: Separate sticky header for artist name
  - Removed "scroll to explore" hint
  - Increased works gap for better breathing room
  - Made scroll distance adaptive to work count

### Fixed
- Gallery mode scroll locking - now pins only artist column, not whole page
- Mobile scroll - separate sticky header instead of column pinning
- Scroll distance - now adaptive based on actual number of works
- Mobile artist info - now visible on mobile (photo, name, bio)
- Mobile sticky name - removed entirely (name now in image caption)
- Image fade issues - removed all fade animations, works now always visible
- Manifesto fade animations - removed all fade animations from manifesto too
- Images not appearing - fixed by removing all scroll animations from works
- **Too much empty space** - reduced gaps between works (4rem → 2rem) and artist blocks (4rem → 1rem)
- **Image names bad on desktop** - added gallery-like metadata display (dimensions, material, medium)
- **Image names on mobile** - added metadata in caption (dimensions, material, medium)

---

## [0.0.0] - Initial Release
