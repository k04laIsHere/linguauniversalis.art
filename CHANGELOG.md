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
  - **Pinned scroll orchestration**: Artist blocks pin while scrolling through their works
    - Each artist stays fixed on the left while user browses their works on the right
    - Smooth, frictionless scroll transitions between artists
    - Scroll up from first artist returns to manifesto/prism
    - Works animate in and out with GSAP scrubbing
    - Preserves existing scroll-based effects
  - Scroll hint indicator in manifesto section
  - Minimalist contact form with border-bottom inputs
  - Mobile responsive variant (artist name above artworks, no sticky columns)
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

---

## [0.0.0] - Initial Release
