# Run Tests in GitHub Codespaces

This repo includes a dev container configured for Playwright browsers.

## Open in Codespaces

1. Push the repo to GitHub (or open your fork).
2. Click the green "Code" button → "Codespaces" → "Create codespace".
3. The container image is `mcr.microsoft.com/playwright:v1.55.0-jammy`.
On first start it runs `npm ci` and installs the Chromium browser only for faster e2e cycles.

Tip: pick a larger machine (4+ cores) for faster e2e runs.

## Run Tests

- Unit tests:

  ```bash
  npm run test:unit
  ```

- E2E tests (Chromium only):

  ```bash
  npm test
  # or
  npm run test:chromium
  # or
  npx playwright test --project=chromium
  ```

- E2E tests (all browsers):

  ```bash
  npm run test:all
  # or
  npx playwright test
  ```

- Single file or project:

  ```bash
  npx playwright test tests/outline.spec.ts --project=chromium
  ```

## View Reports and Traces

- HTML report:

  ```bash
  npx playwright show-report --port 9323
  ```

  The dev container forwards port 9323 automatically. Use the Ports panel to open it in your browser.

- Traces/videos/screenshots are saved to `test-results` when tests fail. You can download them from the Codespaces file explorer or open them using the Playwright VS Code extension (preinstalled in this container).

## Troubleshooting

- If dependencies change, run:

  ```bash
  npm ci
  npx playwright install
  ```

- If WebKit/Firefox tests are slow, try limiting to a single project first to validate changes:

  ```bash
  npx playwright test --project=chromium
  ```
