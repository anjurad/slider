# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-08-24
### Added
- Style UI color pickers for App background (`appBg1`, `appBg2`) and Slide background (`slideBg1`, `slideBg2`).
- Deck-level and per-slide front-matter support for background colors and other settings.
- Playwright E2E test coverage for markdown parsing, overlays, opacity behavior, presets, and style pickers.
- Sample presentation (`sample_presentation.md`) fixes to ensure valid front-matter examples.
- Annotated release tag `v1.0.0` and project snapshot.

### Misc
- Project backup archive created: `../slider-backup-20250824.zip`


## [1.0.1] - 2025-08-31
### Changed
- Rename single-file HTML entry from `slide_app_v_0_91.html` to `slider.html` for clarity and consistency with the project name.
- Prefer runtime theme helpers for slide background CSS variables in `slider.html` (use `src/runtime/theme.js` helpers when available, with deterministic local fallbacks). This preserves the canonical formatting (blur → 2 decimals, rgba alpha → 3 decimals) used by tests and avoids visual/persistence regressions.

### Fixed
- Replaced a brittle absolute path in `tests/thumb-refresh.spec.ts` with a repo‑relative file URL.
- Resolved a persistence edge case where restoring visual state via runtime helpers didn't update in-memory `CONFIG.slideOpacity`; the in-memory config now stays consistent after helper-based restores.
