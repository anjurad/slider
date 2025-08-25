## Slider

This repo contains a single-file HTML-based slide application and a Playwright test suite.

Refactor work-in-progress is tracked in `docs/refactor-plan.md`. The goal is to gradually modularize code while keeping tests green.

## Tests

- Playwright E2E tests live under `tests/`.
- Vitest unit tests live under `unit/`.

- Run Playwright E2E (single command):
  - `npm run test:e2e`
- Run unit tests with Vitest:
  - `npm run test:unit`
- Run the full Playwright matrix:
  - `npm run test:all`
- Open Playwright test UI:
  - `npm run test:ui`

This split prevents Playwright from discovering Vitest unit files which caused import errors during broad runs.

Refactor notes and developer tips are in `docs/refactor-plan.md`.
# Slider

This repo contains a single-file HTML-based slide application and a Playwright test suite.

Refactor work-in-progress is tracked in `docs/refactor-plan.md`. The goal is to gradually modularize code while keeping tests green.

## Tests

- Run a single suite (fast):
  - `npm test`
- Run the full matrix:
  - `npm run test:all`
- Open test UI:
  - `npm run test:ui`

