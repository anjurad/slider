import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Overlay position controls (live)', () => {
  test('Clicking position buttons updates overlay class immediately and persists', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    // Enable overlay via Style
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.check('#cfgOverlayTitleOn');
    await page.check('#cfgOverlaySubtitleOn');

    // Click BR in the 2x2 overlay position grid
    // Assuming buttons carry data-pos attributes tl,tr,bl,br
    await page.click('#cfgOverlayPos button[data-pos="br"]');

    // While modal is open, overlay should reflect pos-br
    await expect(page.locator('.slide.active .slide-overlay')).toHaveClass(/pos-br/);

    // Save and ensure it persists
    await page.click('#cfgSave');
    await expect(page.locator('.slide.active .slide-overlay')).toHaveClass(/pos-br/);

    // Re-open Style and ensure the UI reflects the selection
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    const pressed = await page.locator('#cfgOverlayPos button[data-pos="br"]').getAttribute('aria-pressed');
    expect(pressed).toBe('true');
  });
});

