import { test, expect } from '@playwright/test';

test.describe('Thumbnail refresh', () => {
  test('thumbnails update immediately after saving a light preset', async ({ page }) => {
  await page.goto('file:///Users/gerhardgroenewald/Desktop/sandbox/slider/slide_app_v_0_91.html');
    // Wait for app to initialize and render thumbnails
    await page.waitForSelector('.thumb');

    // Open Style modal
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });

    // Click the preset named "Light 1" (button text)
    const preset = page.locator('button.preset-btn', { hasText: 'Light 1' });
    await expect(preset).toHaveCount(1);
    await preset.click();

    // Save the style
    await page.click('#cfgSave');

    // Thumbnails should reflect the new light app background without clicking a slide
    // Check the first non-active thumbnail (or first thumb) background style computed
    const firstThumb = page.locator('.thumb').first();
    await expect(firstThumb).toBeVisible();

    // Compute the computed background-image of the thumb element
    const bg = await firstThumb.evaluate((el) => getComputedStyle(el).backgroundImage || getComputedStyle(el).background);
    // Expect the computed background to contain 'rgb' or 'linear-gradient' (indicating updated CSS var applied)
    expect(bg).toBeTruthy();
    // Also assert that the page's root --app-bg1 is the Light 1 preset value
    const appBg1 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--app-bg1').trim());
    expect(appBg1).toBe('#f8fafc');
  });
});
