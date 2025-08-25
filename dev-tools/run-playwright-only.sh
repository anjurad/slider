#!/usr/bin/env bash
set -euo pipefail

# Helper: run Playwright E2E against tests/ only (excludes unit/)
echo "Installing dependencies..."
npm ci

echo "Installing Playwright browsers..."
npx playwright install --with-deps

echo "Running Playwright E2E suite..."
npm run test:e2e

echo "Done."
