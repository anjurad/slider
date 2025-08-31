// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

async function setInputFile(page, selector, content, filename='deck.md'){
  const tmp = path.resolve(__dirname, `.__tmp_${Date.now()}_${Math.random().toString(36).slice(2)}_${filename}`);
  fs.writeFileSync(tmp, content, 'utf8');
  await page.setInputFiles(selector, tmp);
  fs.unlinkSync(tmp);
}

test.describe('Clear preset and deck frontmatter', () => {
  test('Clear button sets opacity to 0%', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');
    await page.click('#styleBtn');
    // Click the clear button next to slider
    await page.getByRole('button', { name: /^Clear$/ }).click();

    // Slider should be 0 and readout show (0%)
    await expect(page.locator('#cfgSlideOpacity')).toHaveJSProperty('value', '0');
    await expect(page.locator('#cfgSlideOpacityVal')).toHaveText('(0%)');
  });

  test('Deck frontmatter background applies on load', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Create a small deck with background frontmatter
    const md = `---\nbackground: particles\n---\n# A\n\n---\n# B\n`;
    await setInputFile(page, '#fileInput', md, 'deck.md');

  // Button label reflects bg mode change (await text update)
  await expect(page.locator('#bgBtn')).toHaveText(/Particles|✨/i);
  });
});
