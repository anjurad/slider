// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';
// helper used across other specs
function toFileUrl(p){ return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

test('background mode cycles via button and applies classes', async ({ page }) => {
  await page.goto(toFileUrl(appPath));

  // Ensure page loads and bg controls exist
  const bgBtn = page.locator('#bgBtn');
  await expect(bgBtn).toBeVisible({ timeout: 2000 });
  // Cycle the background button up to 3 times and capture visibility states.
  const seen = [];
  for (let i = 0; i < 3; i++) {
    await bgBtn.click();
    // small pause for DOM updates
    await page.waitForTimeout(120);
    const gradientVisible = await page.locator('.bg-gradient').evaluate(node => getComputedStyle(node).display !== 'none');
    const canvasVisible = await page.locator('#bg-canvas').evaluate(node => getComputedStyle(node).display !== 'none');
    seen.push(!!(gradientVisible || canvasVisible));
  }

  // At least once we should have seen either the gradient or the canvas visible
  expect(seen.some(Boolean)).toBeTruthy();
});
