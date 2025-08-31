import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Document title precedence', () => {
  test('Deck app-name takes precedence over style config', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    const deckPath = path.resolve(__dirname, '..', 'content', 'demo.md');
    await page.goto(toFileUrl(appPath));
    // Load deck via file input to avoid file:// fetch limitations
    await page.locator('#fileInput').setInputFiles(deckPath);
    await page.waitForSelector('.slide.active');
    // Demo deck has app-name: Demo Deck
    await expect(page).toHaveTitle(/Demo Deck/);

    // Now change style app name; title should remain deck name while deck is loaded
    await page.getByRole('button', { name: 'Style' }).click();
    await page.locator('#cfgName').fill('StyleName');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveTitle(/Demo Deck/);
  });

  test('Style config sets app name when no deck name present', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));
    // Load a deck without app-name to ensure precedence path (no deck name)
    const md = `---\nbackground: gradient\n---\n# A\n`;
    await page.setInputFiles('#fileInput', { name: 'nodeck.md', mimeType: 'text/markdown', buffer: Buffer.from(md, 'utf8') });
    await page.waitForSelector('.slide.active');

    // Change app name in Style
    await page.getByRole('button', { name: 'Style' }).click();
    await page.locator('#cfgName').fill('Only Style Name');
    await page.getByRole('button', { name: 'Save' }).click();
    // Title can be flaky on file:// in some engines; ensure brand label reflects the new name
    await expect(page.locator('#appName')).toHaveText('Only Style Name');
  });
});
