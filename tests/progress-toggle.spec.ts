// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

test.describe('Progress bar toggle via P key', () => {
  test('toggles when UI is on', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

  // Ensure visible initially
  const progress = page.locator('.deck-footer .progress');
  const arrows = page.locator('.deck-footer > div').first();
  const slideNo = page.locator('#slideNo');
  await expect(progress).toBeVisible();
  await expect(arrows).toBeVisible();
  await expect(slideNo).toBeVisible();

    // Press P to hide
  await page.keyboard.press('KeyP');
  await expect(progress).toBeHidden();
  await expect(arrows).toBeHidden();
  await expect(slideNo).toBeHidden();

    // Press P to show
  await page.keyboard.press('KeyP');
  await expect(progress).toBeVisible();
  await expect(arrows).toBeVisible();
  await expect(slideNo).toBeVisible();
  });

  test('P override resets on UI toggle (U)', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');
    const progress = page.locator('.deck-footer .progress');
    const arrows = page.locator('.deck-footer > div').first();
    const slideNo = page.locator('#slideNo');

    // Ensure visible initially
    await expect(progress).toBeVisible();
    await expect(arrows).toBeVisible();
    await expect(slideNo).toBeVisible();

    // Press P to hide via override
    await page.keyboard.press('KeyP');
    await expect(progress).toBeHidden();
    await expect(arrows).toBeHidden();
    await expect(slideNo).toBeHidden();

  // Toggle UI off (U): override cleared; with UI off and default config, progress is hidden
  await page.keyboard.press('KeyU');
  await expect(progress).toBeHidden();
  await expect(arrows).toBeHidden();
  await expect(slideNo).toBeHidden();

  // Toggle UI on again (U): still no override, defaults show progress
  await page.keyboard.press('KeyU');
  await expect(progress).toBeVisible();
  await expect(arrows).toBeVisible();
  await expect(slideNo).toBeVisible();
  });

  test('P override resets on deck load', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');
    const progress = page.locator('.deck-footer .progress');
    const arrows = page.locator('.deck-footer > div').first();
    const slideNo = page.locator('#slideNo');

    // Hide with P override first
    await page.keyboard.press('KeyP');
    await expect(progress).toBeHidden();
    await expect(arrows).toBeHidden();
    await expect(slideNo).toBeHidden();

    // Load a tiny deck, which should clear the override via applyDeckFrontmatter
    const md = `---\nui: on\n---\n# A\n`;
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('#fileInput');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({ name: 'deck.md', mimeType: 'text/markdown', buffer: Buffer.from(md, 'utf8') });

    await expect(progress).toBeVisible();
    await expect(arrows).toBeVisible();
    await expect(slideNo).toBeVisible();
  });
  test('toggles when UI is off with hide-progress enabled', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Enable hideProgressWithUi in config via UI and turn UI off
    await page.click('#styleBtn');
    // Ensure the checkbox exists and is checked
    const cb = page.locator('#cfgHideProgressWithUi');
    await expect(cb).toHaveJSProperty('checked', true);
    await page.click('#cfgSave');

    // Turn UI off
    await page.keyboard.press('KeyU');
    await expect(page.locator('body')).toHaveClass(/ui-off/);

  // Initially hidden due to mask
  const progress2 = page.locator('.deck-footer .progress');
  const arrows2 = page.locator('.deck-footer > div').first();
  const slideNo2 = page.locator('#slideNo');
  await expect(progress2).toBeHidden();
  await expect(arrows2).toBeHidden();
  await expect(slideNo2).toBeHidden();

    // P should show it even under mask
  await page.keyboard.press('KeyP');
  await expect(progress2).toBeVisible();
  await expect(arrows2).toBeVisible();
  await expect(slideNo2).toBeVisible();

    // P again should hide
  await page.keyboard.press('KeyP');
  await expect(progress2).toBeHidden();
  await expect(arrows2).toBeHidden();
  await expect(slideNo2).toBeHidden();
  });
});
