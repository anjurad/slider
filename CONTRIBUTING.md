# Contributing

Thanks for contributing. Quick notes to get your development environment ready and run tests.

## Run tests locally

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

## CI

We run CI via GitHub Actions. The workflow executes unit tests first, then runs Playwright E2E in parallel across browsers. Node modules are cached to speed up runs.
