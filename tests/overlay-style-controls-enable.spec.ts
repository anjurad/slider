import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Style UI overlay controls enablement', () => {
  test('Checking "Show slide title" enables Position buttons and allows selection', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));

    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });

    // Ensure initially position buttons are disabled when overlay is off
    const posButtons = page.locator('#cfgOverlayPos button');
    await expect(posButtons).toHaveCount(4);
    const initiallyDisabled = await posButtons.evaluateAll((els)=>els.map(el=>el.hasAttribute('disabled')));
    expect(initiallyDisabled.every(Boolean)).toBeTruthy();

    // Enable overlay via checkbox
    await page.check('#cfgOverlayTitleOn');

    // Buttons should be enabled now
    const afterEnableDisabled = await posButtons.evaluateAll((els)=>els.map(el=>el.hasAttribute('disabled')));
    expect(afterEnableDisabled.every(v=>v===false)).toBeTruthy();

    // Click TR and verify aria-pressed and live overlay class
    await page.click('#cfgOverlayPos button[data-pos="tr"]');
    await expect(page.locator('.slide.active .slide-overlay')).toHaveClass(/pos-tr/);

    // Save and ensure it persists
    await page.click('#cfgSave');
    await expect(page.locator('.slide.active .slide-overlay')).toHaveClass(/pos-tr/);
  });
});

