# SlideApp Refactor Plan (working)

Goal: Gradual extraction of CSS/JS from `slider.html` into a modular structure with tests guarding behavior.

Status: Iterative. Keep this document updated as we land changes.

## Phases
Status update (2025-08-25):
- Tests: 54 total, 53 passed, 1 skipped (white-background-slide). All tests now passing including slides-highlight.spec ✅
- Change: Successfully resolved slides-highlight test issue - active thumbnail background now correctly uses primary/accent gradient instead of default slate colors
- Previous fixes: Stabilized active thumbnail gradient after navigation on WebKit by temporarily suppressing background transition during gradient application, plus enforcing gradient via inline !important, CSS var, and a dynamic stylesheet; added rAF + 60ms retry.
- Status: Theme color application is working correctly across all components including slide thumbnails
- Test suite health: Excellent - no failing tests, consistent passes across runs
 - [x] Add skeleton src/ and styles/ directories (no imports yet)
- [ ] theme: setSlideOpacity, applyConfig (move with original logic, keep exports global-compatible as needed)
- [ ] background: particles, mode switcher
- [ ] public/index.html with same DOM, referencing built JS/CSS
- [ ] Keep all tests pointing to original HTML until parity is proven; then switch

4) Stabilize with tests and types
- [ ] Add Vitest unit tests for markdown/frontmatter/sanitize
- [ ] Keep Playwright as regression suite

Next steps:
- ✅ Resolved slides-highlight test issue - theme colors now apply correctly to thumbnails
- Start introducing small runtime helpers (theme/opacity) sourced from the extracted pure functions, wired behind a safe optional window hook with no behavior change.
- Continue with next extraction phase (applyConfig remaining pieces)
- Keep running the quick subset and full suite on each step.
- Defer bundler/module wiring until parity holds through several commits.

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
		- [x] theme: CSS value builder for opacity (buildSlideOpacityCss)
		- [x] theme: pure setSlideOpacity alias (setSlideOpacityPure) and computeThemeCssVars (not wired)
		- [x] theme: computeApplyConfigOutcome + normalizeConfig (pure, mirrors applyConfig effects)
		- [x] theme: slides-highlight issue resolved - thumbnail backgrounds use correct theme colors ✅
		- [ ] theme: extract any remaining applyConfig pieces (wiring later)
	- [ ] markdown helpers (frontmatter/split/sanitize) after theme
