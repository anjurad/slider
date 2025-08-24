import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) { return 'file://' + path.resolve(p); }

const appPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');

test('Title/subtitle size sliders disabled when overlay is off', async ({ page }) => {
  await page.goto(toFileUrl(appPath));
  await page.waitForSelector('.slide.active');

  // Open Style
  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });

  // Overlay off by default; sliders disabled
  await expect(page.locator('#cfgTitleSize')).toBeDisabled();
  await expect(page.locator('#cfgSubtitleSize')).toBeDisabled();

  // Turn overlay on => sliders enabled
  await page.check('#cfgOverlayTitleOn');
  await expect(page.locator('#cfgTitleSize')).toBeEnabled();
  await expect(page.locator('#cfgSubtitleSize')).toBeEnabled();

  // Save and then toggle overlay off via toolbar; reopening should show sliders disabled again
  await page.click('#cfgSave');
  await page.click('#overlayBtn');
  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });
  await expect(page.locator('#cfgTitleSize')).toBeDisabled();
  await expect(page.locator('#cfgSubtitleSize')).toBeDisabled();
});
