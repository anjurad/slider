# Slider

<<<<<<< HEAD
Single‑file HTML slide app that renders Markdown into interactive slides — no build step required. The application ships as `slider.html` and includes a small runtime, tests, and docs.
=======
This repo contains a single-file HTML-based slide application and a Playwright test suite.

 

Slider — HTML5 Slide Presentation Application

Slider is a single-file HTML5 slide presentation application that renders Markdown content as interactive slides. The application is delivered as a single-file app at `slider.html` and includes styling, JavaScript runtime, and sample content so you can run it directly in a browser.
>>>>>>> origin/main

Key features
- Markdown-based slides (split with a line containing only `---`).
- Background modes: ✨ Particles, 🌌 Gradient, ⛔ Off (respects prefers-reduced-motion).
- Per-deck frontmatter support (colors, background, app name, overlay, opacity and more).
- Button styling: Auto/Custom button text color and Solid/Outline fills.
- Keyboard shortcuts for navigation and quick toggles (Background, UI, Opacity, Outline, Notes, Slides drawer).
- Theming system and a small Style modal for colors, overlay, and outline settings.
- Export / print (use browser print to PDF) and fullscreen support.
- Enhanced Markdown: strikethrough, task lists, admonitions, autolinked URLs, linkable headings + in‑app TOC.
 - Overlay behaviour: Reserved (default, non‑overlapping), Float (no padding), Auto (fade + adaptive padding on overlap; see docs).

<<<<<<< HEAD
## Static Site Mode
=======
## Static Site Mode (new)
>>>>>>> origin/main

Render decks directly from the repository without uploading files.

- Add your Markdown decks under `content/`
- List them in `slides.json` at the repo root:

```
{
  "decks": [
    { "title": "Welcome", "path": "content/welcome.md" },
    { "title": "Demo Deck", "path": "content/demo.md" },
    { "title": "Sample Presentation", "path": "sample_presentation.md" }
  ]
}
```

Usage
- Open `slider.html` (locally or on GitHub Pages). If multiple decks are listed, a 📚 Decks button appears to choose a deck. If a single deck is listed, it loads automatically.
<<<<<<< HEAD
- Deep‑link to a specific deck with `?deck=PATH`:
=======
- Deep-link to a specific deck with `?deck=PATH`:
>>>>>>> origin/main
  - Example: `slider.html?deck=content/welcome.md`
- The existing upload button remains available for ad‑hoc files.

GitHub Pages (from this feature branch)
- Push this branch (`feature/static-site-render`) and configure GitHub Pages:
  - Repo Settings → Pages → Build and deployment → Source: “Deploy from a branch”
  - Branch: `feature/static-site-render` • Folder: `/root` (or `/docs` if you prefer)
  - URL will be: `https://<org-or-user>.github.io/<repo>/slider.html`
- Commit your decks in `content/` and update `slides.json`; Pages will serve them as static assets.

Notes
- Static Site Mode is additive; theming, overlays, navigation, and validation all remain intact.
- `slides.json` is optional; without it, Slider behaves as before (restores last deck or loads `sample_presentation.md`).
<<<<<<< HEAD
- Title precedence: the browser tab uses deck `app-name` when present; otherwise it uses the Style UI app name.
 - Button styling: configure `btnTextColor` (`auto` or `#rrggbb`) and `btnFill` (`solid`/`outline`) via Style UI, external config, or deck frontmatter.
=======
>>>>>>> origin/main

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

- Quick (no server): open the `slider.html` file directly in your browser via a `file://` URL.
- Recommended: run a small local HTTP server and open the app in a browser:

```bash
python3 -m http.server 8000
# open http://localhost:8000/slider.html
```

## Visual preview

Here's a small animated preview to help reviewers quickly see the app layout without opening a browser.

<div style="max-width:480px;">
  <img src="assets/preview.svg" alt="Slider preview" style="width:100%;height:auto;border-radius:8px;border:1px solid rgba(255,255,255,0.04)" />
</div>

What to try
<<<<<<< HEAD
- Static mode: open the 📚 Decks picker and load a deck from `slides.json`.
- Or click the top toolbar "Load Markdown" (📁) and choose a Markdown file.
=======
- The app loads `sample_presentation.md` automatically on first run.
 - Static mode: open the 📚 Decks picker and load a deck from `slides.json`.
- Click the top toolbar "Load Markdown" button (📁) and choose a Markdown file to load your slides.
>>>>>>> origin/main
- Navigate with ← / → keys or on-screen arrows; thumbnails appear in the left drawer.
- Try “Validate” (🔎) to lint your deck’s frontmatter. Use the “📑 TOC” to browse headings and jump around.
 - Overlay: choose Reserved (no overlap), Float, or Auto fade (adaptive). Reserved is the default.
- Validate your deck: Click “Validate” in the header to check frontmatter keys and values. Or run `npm run validate:deck -- path/to/deck.md` locally to lint Markdown decks in CI or pre-commit.
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

- Validate decks (authoring aid):

```bash
npm run validate:deck -- sample_presentation.md
```
Shows warnings for unknown frontmatter keys and invalid values, with suggestions for the new namespaced schema.

Authoring quick guide
- Strikethrough: `~~deprecated~~` → ~deprecated~
- Task list:
  - [ ] Collect feedback
  - [x] Ship 1.0.1
- Admonitions:
  ::: tip
  Pro tip: Use the TOC (📑) to jump between sections.
  :::
- Autolink literal: paste `https://example.com` — it becomes a link
- Anchors: h1–h3 get stable ids; click the “#” to copy a link to a heading

See docs/markdown-spec.md for complete details and examples.
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

<<<<<<< HEAD
Project structure
- `slider.html` — single‑file application (HTML/CSS/JS).
- `content/` — example decks (Static Site Mode).
- `slides.json` — manifest for Static Site Mode.
- `sample_presentation.md` — bundled sample deck for manual testing.
- `src/` — runtime helpers and TypeScript sources.
- `docs/` — authoring and configuration docs.
- `tests/` — Playwright E2E tests; `unit/` — Vitest unit tests.
=======
Project structure (important files)
- `slider.html` — the single-file application (HTML/CSS/JS).
- `sample_presentation.md` — bundled sample deck used for manual testing.
- `src/` — runtime helpers and TypeScript sources.
- `tests/` — Playwright E2E tests.
- `unit/` — Vitest unit tests for utilities.
>>>>>>> origin/main
- `dev-tools/` — helper scripts (e.g., `run-playwright-only.sh`).
- `package.json`, `playwright.config.ts`, `tsconfig.json` — project scripts and config.

## External Config

You can now load and update theme/config externally without editing code.

- URL param: append `?config=<url>` to `slider.html` to fetch a JSON config.
  - Example: `slider.html?config=https://example.com/slideapp-config.json`
  - Requires CORS on the remote origin.
- Style modal (🎨):
  - Load from URL, Import JSON (file), Export current config.
  - Persist toggle: “Persist config to this browser” controls saving to `localStorage`.
- Programmatic API:
  - Post a message to the window:

```
window.postMessage({
  type: 'slider.config',
  action: 'merge', // 'merge' (default) | 'replace'
  config: { primary: '#01B4E1', accent: '#64FFFC', contentPos: 'mr' }
}, '*');
```

Notes
- Storage key: `localStorage['slideapp.config']` holds the config when persist is enabled.
- Persist preference is stored separately under `localStorage['slideapp.config.persist']`.
- Unknown keys are ignored; values are validated and sanitized (colors → `#rrggbb`, ranges for numbers, allowed enums).

More details: `docs/external-config.md`.

## Authoring & Validation
- Authoring guide with frontmatter keys (deck/slides), content position, overlays, and validator usage: `docs/authoring.md`.
- Implementation details and behavior notes: `docs/markdown-spec.md`.

### Content Position
- Control where the Markdown block sits inside the slide: TL/TM/TR, ML/MM/MR, BL/BM/BR.
- Set via Style (🎨) → Content position, deck frontmatter (`content-pos: mm`), per-slide frontmatter, or external config (`contentPos`).
- Precedence: per-slide > deck > config > default (TL).

Tip: Open the app without a deck to see the updated in‑app demo (cover + content‑position slides) showcasing TL/MR/BR variations and overlay examples.

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
