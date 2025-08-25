# Slider

This repo contains a single-file HTML-based slide application and a Playwright test suite.

Refactor work-in-progress is tracked in `docs/refactor-plan.md`. The goal is to gradually modularize code while keeping tests green.

Slider — HTML5 Slide Presentation Application

Slider is a single-file HTML5 slide presentation application that renders Markdown content as interactive slides. The application is delivered as a single-file app at `slide_app_v_0_91.html` and includes styling, JavaScript runtime, and sample content so you can run it directly in a browser.

Key features
- Markdown-based slides (split with a line containing only `---`).
- Background modes: ✨ Particles, 🌌 Gradient, ⛔ Off (respects prefers-reduced-motion).
- Per-deck frontmatter support (colors, background, app name, overlay, opacity and more).
- Keyboard shortcuts for navigation and quick toggles (Background, UI, Opacity, Outline, Notes, Slides drawer).
- Theming system and a small Style modal for colors, overlay, and outline settings.
- Export / print (use browser print to PDF) and fullscreen support.

Quick start (local)
1. Clone the repo and change to the project folder:

```bash
git clone <repo-url> && cd slider
```

2. Install developer dependencies (required for tests and linting):

```bash
npm install
# or for reproducible installs in CI
npm ci
```

3. Open the application in a browser:

- Quick (no server): open the `slide_app_v_0_91.html` file directly in your browser via a `file://` URL.
- Recommended: run a small local HTTP server and open the app in a browser:

```bash
python3 -m http.server 8000
# open http://localhost:8000/slide_app_v_0_91.html
```

## Visual preview

Here's a small, static inline SVG preview to help reviewers quickly see the app layout without opening a browser.

<div style="max-width:420px;">
  <svg width="420" height="220" viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Slider app preview">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#01B4E1" />
        <stop offset="100%" stop-color="#64FFFC" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="420" height="220" rx="12" fill="url(#g1)" />
    <rect x="16" y="16" width="152" height="188" rx="8" fill="#0b1220" opacity="0.6" />
    <rect x="176" y="16" width="228" height="188" rx="12" fill="#0f1723" opacity="0.8" />
    <rect x="186" y="26" width="208" height="36" rx="6" fill="url(#g2)" />
    <text x="196" y="50" font-family="Inter, sans-serif" font-size="14" fill="#fff">SlideApp</text>
    <text x="24" y="36" font-family="Inter, sans-serif" font-size="12" fill="#fff">Slides</text>
    <g transform="translate(196,72)" fill="#fff" font-family="Inter, sans-serif">
      <text x="0" y="0" font-size="18" font-weight="700">Hello SlideApp</text>
      <text x="0" y="24" font-size="12" fill="#cbd5e1">Use arrow keys to navigate</text>
    </g>
    <circle cx="386" cy="36" r="10" fill="#fff" opacity="0.08" />
  </svg>
</div>

What to try
- The app loads `sample_presentation.md` automatically on first run.
- Click the top toolbar "Load Markdown" button (📁) and choose a Markdown file to load your slides.
- Navigate with ← / → keys or on-screen arrows; thumbnails appear in the left drawer.
- Useful keys:
  - B — cycle background modes (Particles → Gradient → Off)
  - T — toggle slide transparency (0% ↔ baseline)
  - U — toggle UI visibility (hide/show header & footer)
  - P — toggle progress bar
  - O — toggle text outline
  - S — open Slides drawer (thumbnails)
  - N — toggle Notes panel

Developer workflow
- Lint (required before committing):

```bash
npm run lint
```

- Unit tests (fast):

```bash
npm run test:unit
```

- Playwright E2E tests (browsers required):

Before running E2E, install browsers (may take 10–20 minutes on first run):

```bash
npx playwright install --with-deps
```

Then run E2E:

```bash
npm run test:e2e
# or run all tests
npm run test:all
```

Notes about E2E and CI
- Playwright tests run against Chromium, Firefox and WebKit in CI. If the browser install fails because of network restrictions, you can still validate the project by running unit tests and lint locally and performing manual checks in your browser.
- The repo includes `dev-tools/run-playwright-only.sh` to automate browser installs + E2E runs.

Manual validation checklist (recommended after changes)
- Load & Navigate
  - Open the app and confirm `sample_presentation.md` loads automatically.
  - Use arrow keys to navigate and confirm the slide counter updates.
  - Confirm thumbnails are shown in the Slides drawer and active slide is highlighted.

- File loading
  - Click "Load Markdown" and select `sample_presentation.md` (or your deck). Confirm slides render and navigation works.

- Keyboard shortcuts
  - Verify T, U, P, O, B keys perform expected actions and UI updates.

- Style & Theming
  - Open "Style" (🎨), change a preset, save and confirm colors update across the UI. Use Reset to restore defaults.

- Interactive features
  - Notes, background switching, transparency toggle, and thumbnails should behave as expected.

Project structure (important files)
- `slide_app_v_0_91.html` — the single-file application (HTML/CSS/JS).
- `sample_presentation.md` — bundled sample deck used for manual testing.
- `src/` — extracted modules and TypeScript sources (refactor-in-progress).
- `tests/` — Playwright E2E tests.
- `unit/` — Vitest unit tests for utilities.
- `dev-tools/` — helper scripts (e.g., `run-playwright-only.sh`).
- `package.json`, `playwright.config.ts`, `tsconfig.json` — project scripts and config.

Troubleshooting & tips
- If Playwright browser installs fail due to network restrictions, run `npm run lint` and `npm run test:unit` locally and manually validate core UI scenarios in a browser.
- E2E failures can be timing-related; tests include defensive waits and guards. If you see flakiness, the test output and `test-results/` (screenshots/videos/error-context) are useful for diagnosis.

Contributing
- Run `npm run lint` before committing — CI enforces zero ESLint warnings.
- Add unit tests for utility code in `unit/` and E2E tests in `tests/` when changing UI behaviour.

License & credits
- See `CHANGELOG.md` and `CONTRIBUTING.md` for project notes. Check `LICENSE` if present.

Contact / support
- Use the GitHub issue tracker for bugs and feature requests.

Next steps I can take for you
- Remove the lightweight debug instrumentation that was temporarily added to `slide_app_v_0_91.html` during troubleshooting.
- Make the README shorter or add visuals (screenshots/GIF).
- Open a PR with these README changes.

