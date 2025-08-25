# SlideApp Refactor Plan (working)

Goal: Gradual extraction of CSS/JS from `slide_app_v_0_91.html` into a modular structure with tests guarding behavior.

Status: Iterative. Keep this document updated as we land changes.

## Phases

1) Plan and scaffolding (no behavior changes)
 - [x] Capture plan file (this one)
 - [x] Add skeleton src/ and styles/ directories (no imports yet)
 - [x] Add tooling config placeholders (tsconfig, eslint/prettier, vite) — not wired yet

2) Extract minimal, test-neutral modules
- [ ] theme: setSlideOpacity, applyConfig (move with original logic, keep exports global-compatible as needed)
- [ ] background: particles, mode switcher
- [ ] markdown: parseFrontmatter, splitSlides, parseMarkdown, sanitizeHTML

3) Replace inline script with module imports
- [ ] public/index.html with same DOM, referencing built JS/CSS
- [ ] Keep all tests pointing to original HTML until parity is proven; then switch

4) Stabilize with tests and types
- [ ] Add Vitest unit tests for markdown/frontmatter/sanitize
- [ ] Keep Playwright as regression suite

5) Cleanup & CI
- [ ] Linting/formatting
- [ ] GitHub Actions or local CI script

## Non-goals (for now)
- No framework adoption
- No design overhaul
- No behavior changes beyond bug fixes caught by tests

## Risks & mitigations
- Test regressions: work in tiny steps and run a subset of tests frequently
- Session memory: avoid large workspace-wide rewrites; keep diffs small
- Loader paths: `fetch('sample_presentation.md')` relies on relative path; ensure it still resolves under new structure or keep legacy html for tests

## Next actions
- Create `src/` and `styles/` empty scaffolds — done
- Land README pointers in docs/ — done
- Extract tiny, pure helpers first — in progress
	- [x] theme helpers: normalizeHex, hexToRgb, bestContrastForHex (in `src/app/theme.ts`, not wired)
	- [x] theme: pure helpers for opacity and derived UI colors (computeSlideOpacityVars, computeBtnTextColor, computeMutedFromText)
	- [ ] theme: setSlideOpacity, applyConfig (extract next, keep behavior identical)
	- [ ] markdown helpers (frontmatter/split/sanitize) after theme
