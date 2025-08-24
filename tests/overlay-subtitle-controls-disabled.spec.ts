import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) { return 'file://' + path.resolve(p); }

const appPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');

test('Subtitle controls disabled/enabled with overlay', async ({ page }) => {
  await page.goto(toFileUrl(appPath));
  await page.waitForSelector('.slide.active');

  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });

  // Overlay off by default: subtitle checkbox and color select disabled
  await expect(page.locator('#cfgOverlaySubtitleOn')).toBeDisabled();
  await expect(page.locator('#cfgSubtitleColor')).toBeDisabled();

  // Turn overlay on => both enabled
  await page.check('#cfgOverlayTitleOn');
  await expect(page.locator('#cfgOverlaySubtitleOn')).toBeEnabled();
  await expect(page.locator('#cfgSubtitleColor')).toBeEnabled();

  // Save, then turn overlay off via toolbar, reopen modal -> both disabled again
  await page.click('#cfgSave');
  await page.click('#overlayBtn');
  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });
  await expect(page.locator('#cfgOverlaySubtitleOn')).toBeDisabled();
  await expect(page.locator('#cfgSubtitleColor')).toBeDisabled();
});
