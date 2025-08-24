import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) { return 'file://' + path.resolve(p); }

const appPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');

test('Position controls disabled when overlay is off, with hint', async ({ page }) => {
  await page.goto(toFileUrl(appPath));
  await page.waitForSelector('.slide.active');

  // Ensure overlay is off initially
  await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(0);

  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });

  // Should be off by default; position buttons disabled and hint shown
  const posButtons = page.locator('#cfgOverlayPos .btn');
  await expect(posButtons).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(posButtons.nth(i)).toBeDisabled();
  }
  await expect(page.locator('#cfgOverlayPosHint')).toBeVisible();

  // Turn overlay on; buttons enable and hint hides
  await page.check('#cfgOverlayTitleOn');
  for (let i = 0; i < 4; i++) {
    await expect(posButtons.nth(i)).toBeEnabled();
  }
  await expect(page.locator('#cfgOverlayPosHint')).toBeHidden();

  // Save to persist on
  await page.click('#cfgSave');
  await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(1);

  // Toggle overlay off via toolbar; position buttons become disabled again if modal is reopened
  await page.click('#overlayBtn');
  await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(0);
  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });
  for (let i = 0; i < 4; i++) {
    await expect(page.locator('#cfgOverlayPos .btn').nth(i)).toBeDisabled();
  }
  await expect(page.locator('#cfgOverlayPosHint')).toBeVisible();
});
