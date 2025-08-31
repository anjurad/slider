import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) { return 'file://' + path.resolve(p); }

const appPath = path.resolve(__dirname, '..', 'slider.html');

test.describe('Overlay position Style UI', () => {
  test('active highlight, aria-pressed, live preview and persistence', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    // Enable overlay first via Style
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.check('#cfgOverlayTitleOn');
    // Initial active should match default tl
    await expect(page.locator('#cfgOverlayPos .btn.active')).toHaveCount(1);
    await expect(page.locator('#cfgOverlayPos .btn.active')).toHaveText('TL');
    await expect(page.locator('#cfgOverlayPos .btn[aria-pressed="true"]')).toHaveText('TL');

    // Click BR and expect highlight + live preview (overlay appears pos-br)
    await page.click('#cfgOverlayPos .btn[data-pos="br"]');
    await expect(page.locator('#cfgOverlayPos .btn.active')).toHaveText('BR');
    await expect(page.locator('#cfgOverlayPos .btn[aria-pressed="true"]')).toHaveText('BR');

    // With overlay on, live preview should update current slide overlay class
    // Save the style settings
    await page.click('#cfgSave');
    // After save, overlay should be present and positioned at br
    await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(1);
    await expect(page.locator('.slide.active .slide-overlay')).toHaveClass(/pos-br/);

    // Re-open Style and change to TL but Cancel to discard
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.click('#cfgOverlayPos .btn[data-pos="tl"]');
    // Cancel via close button (X)
    await page.click('#cfgClose');
    // Position should remain BR on the slide (discarded temp change)
    await expect(page.locator('.slide.active .slide-overlay')).toHaveClass(/pos-br/);
  });
});
