# SlideApp Refactor Plan (working)

Goal: Gradual extraction of CSS/JS from `slide_app_v_0_91.html` into a modular structure with tests guarding behavior.

Status: Iterative. Keep this document updated as we land changes.

## Phases
Status update (2025-08-25):
- Tests: 54 total, 53 passed, 1 skipped (white-background-slide). Previously failing slides-highlight.spec is now passing consistently.
- Change: Stabilized active thumbnail gradient after navigation on WebKit by temporarily suppressing background transition during gradient application, plus enforcing gradient via inline !important, CSS var, and a dynamic stylesheet; added rAF + 60ms retry.
- Commit: ef6f5f7 fix(slides): stabilize active thumbnail gradient in WebKit.
 - [x] Add skeleton src/ and styles/ directories (no imports yet)
- [ ] theme: setSlideOpacity, applyConfig (move with original logic, keep exports global-compatible as needed)
- [ ] background: particles, mode switcher
- [ ] public/index.html with same DOM, referencing built JS/CSS
- [ ] Keep all tests pointing to original HTML until parity is proven; then switch

4) Stabilize with tests and types
- [ ] Add Vitest unit tests for markdown/frontmatter/sanitize
- [ ] Keep Playwright as regression suite

Next steps:
- Start introducing small runtime helpers (theme/opacity) sourced from the extracted pure functions, wired behind a safe optional window hook with no behavior change.
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
		- [ ] theme: extract any remaining applyConfig pieces (wiring later)
	- [ ] markdown helpers (frontmatter/split/sanitize) after theme
