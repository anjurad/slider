# Slider

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

## Contributing

Thanks for contributing. Quick notes to get your development environment ready and run tests.

### Run tests locally

- Install dependencies:

  ```bash
  npm ci
  ```

- Run unit tests (Vitest):

  ```bash
  npm run test:unit
  ```

- Run Playwright E2E:

  ```bash
  npm run test:e2e
  ```

- Or use the helper script to install browsers and run Playwright:

  ```bash
  ./scripts/run-playwright-only.sh
  ```

### CI

We run CI via GitHub Actions. The workflow executes unit tests first, then runs Playwright E2E in parallel across browsers. Node modules are cached to speed up runs.

