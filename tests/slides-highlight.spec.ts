// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

async function getComputedBgImage(page, selector){
  return page.$eval(selector, el => getComputedStyle(el).backgroundImage);
}

async function setInputValue(page, selector, value){
  await page.fill(selector, value);
}

async function getThumbBgImage(page){
  // The first thumb should be active after initial render
  return getComputedBgImage(page, '.thumb.active');
}

test.describe('Slides drawer highlight uses theme colors', () => {
  test('active thumbnail background uses primary/accent gradient', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Open Style and set a distinctive theme
    await page.click('#styleBtn');
    await setInputValue(page, '#cfgPrimary', '#ff0000'); // red
    await setInputValue(page, '#cfgAccent', '#00ff00'); // lime
    await page.click('#cfgSave');

    // Ensure thumbs exist and the first is active
    await page.waitForSelector('.thumb.active');
    const bg = await getThumbBgImage(page);

  // Expect linear-gradient with our chosen colors (order primary -> accent) in rgb form
  expect(bg.replace(/\s+/g,'').toLowerCase()).toContain('linear-gradient(135deg,rgb(255,0,0),rgb(0,255,0))');

    // Navigate to next slide and assert the highlight moves and still uses theme colors
    await page.keyboard.press('ArrowRight');
    await page.waitForSelector('.thumb.active');
    const bg2 = await getThumbBgImage(page);
  expect(bg2.replace(/\s+/g,'').toLowerCase()).toContain('linear-gradient(135deg,rgb(255,0,0),rgb(0,255,0))');
  });
});
