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
  - **Sticky artist column on desktop**: Artist info stays fixed while browsing works
    - CSS-based sticky positioning (no scroll locking)
    - Artist column stays fixed on left while works scroll naturally
    - Mobile: no sticky positioning, normal vertical scroll
    - Works animate in with GSAP as they enter viewport
    - Preserves existing scroll-based effects
  - Scroll hint indicator in manifesto section
  - Minimalist contact form with border-bottom inputs
  - Mobile responsive variant (artist name above artworks)
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
- **Gallery Mode**: Fixed scroll locking issue
  - Removed GSAP pinning (was locking entire page scroll)
  - Replaced with CSS sticky positioning for artist column
  - Added mobile detection to skip GSAP animations on mobile
  - Works now scroll naturally without any locking

### Fixed
- Gallery mode scroll locking issue - entire page was locking instead of just artist column
- Mobile scroll not working correctly - sticky positioning now disabled on mobile via media query

---

## [0.0.0] - Initial Release
