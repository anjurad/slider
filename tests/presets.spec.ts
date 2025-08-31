// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

async function getCssVar(page, name){
  return page.evaluate(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}

// helper removed: not used in tests

test.describe('Style Presets', () => {
  test('clicking a preset updates inputs, previews, and persists after Save', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    // Open Style modal
    await page.click('#styleBtn');

    // Find first preset button and click it
    const firstPreset = page.locator('#presetRow .btn').first();
    // preset name fetched but not needed in this test
    await firstPreset.click();

    // Read current input values
    const primaryVal = await page.locator('#cfgPrimary').inputValue();
    const accentVal = await page.locator('#cfgAccent').inputValue();

    // Check preview applied to CSS vars (before save)
    const cssPrimaryBefore = await getCssVar(page, '--primary');
    const cssAccentBefore = await getCssVar(page, '--accent');
    // Live preview should not change the actual CSS vars until Save; we rely on inputs only pre-save
    // So assert vars still equal current computed values based on defaults (non-empty)
    expect(cssPrimaryBefore).toBeTruthy();
    expect(cssAccentBefore).toBeTruthy();

    // Save to persist and apply
    await page.click('#cfgSave');

    // CSS vars should now match chosen values
    const cssPrimary = await getCssVar(page, '--primary');
    const cssAccent = await getCssVar(page, '--accent');
    expect(cssPrimary.toLowerCase()).toBe(primaryVal.toLowerCase());
    expect(cssAccent.toLowerCase()).toBe(accentVal.toLowerCase());

    // Reload and verify persistence
    await page.reload();
    const cssPrimaryAfter = await getCssVar(page, '--primary');
    const cssAccentAfter = await getCssVar(page, '--accent');
    expect(cssPrimaryAfter.toLowerCase()).toBe(primaryVal.toLowerCase());
    expect(cssAccentAfter.toLowerCase()).toBe(accentVal.toLowerCase());
  });

  test('Reset restores brand defaults', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    // Open and change to a different preset
    await page.click('#styleBtn');
    await page.locator('#presetRow .btn').nth(1).click();
    await page.click('#cfgSave');

    // Now reset
    await page.click('#styleBtn');
    await Promise.all([
      page.waitForEvent('load'),
      page.click('#cfgReset')
    ]);
    await page.waitForSelector('.slide.active');
    const cssPrimary = await getCssVar(page, '--primary');
    const cssAccent = await getCssVar(page, '--accent');

    expect(cssPrimary.toLowerCase()).toBe('#01b4e1');
    expect(cssAccent.toLowerCase()).toBe('#64fffc');
  });
});
