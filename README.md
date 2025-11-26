# Lingua Universalis — Demo Site

A minimal Vite + React scaffold for a cinematic single-page site.

Quick start:

```bash
# from project root
npm install
npm run dev
```

Notes:
- Default language: Russian (RU). Toggle via the button in the top-right.
- Assets are mapped from the `assets/` directory in the project root. If you add or replace images, update `src/data.js`.
- Animations use `framer-motion` and slow background zoom for atmosphere.

Files of interest:
- `src/data.js` — editable content and translations (RU/EN).
- `src/components` — composable sections (Hero, Manifesto, Characters, Journey, Gallery, Footer).

If you want, I can:
- Add a small custom cursor component that reacts to hover.
- Wire a small overlay mobile menu.
- Replace local assets with Unsplash placeholders if you prefer.
