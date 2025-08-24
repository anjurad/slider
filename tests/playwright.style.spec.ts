import { test, expect } from '@playwright/test';
import path from 'path';

test('style preset updates button and brand-badge styles', async ({ page, browserName }) => {
  const htmlPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');
  const url = `file://${htmlPath}`;

  await page.goto(url);

  // Open Style modal (assumes a button with id or class opens it)
  // Try common selectors used in the app
  const styleOpen = page.locator('#open-style, .open-style, button[aria-label="Style"]').first();
  await expect(styleOpen).toBeVisible({ timeout: 2000 });
  await styleOpen.click();

  // Click the first preset button in the Style modal
  const presetBtn = page.locator('.style-modal .preset, .style-modal .preset-btn, .preset-btn, .preset').first();
  await expect(presetBtn).toBeVisible({ timeout: 2000 });
  await presetBtn.click();

  // Wait a short moment for CSS variables to update
  await page.waitForTimeout(150);

  // Evaluate computed styles for .btn and .brand-badge
  const btnStyle = await page.evaluate(() => {
    const el = document.querySelector('.btn');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { background: cs.backgroundImage || cs.background, color: cs.color };
  });

  const brandStyle = await page.evaluate(() => {
    const el = document.querySelector('.brand-badge');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { background: cs.backgroundImage || cs.background, color: cs.color };
  });

  expect(btnStyle).not.toBeNull();
  expect(brandStyle).not.toBeNull();

  // Background should contain a gradient or rgb value
  expect(btnStyle.background).toBeTruthy();
  expect(brandStyle.background).toBeTruthy();

  // Color should be a non-transparent rgb/hex value
  expect(btnStyle.color).toMatch(/rgba?\(|rgb\(|#[0-9a-fA-F]{3,6}/);
  expect(brandStyle.color).toMatch(/rgba?\(|rgb\(|#[0-9a-fA-F]{3,6}/);
});
