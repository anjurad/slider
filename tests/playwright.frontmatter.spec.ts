import { test, expect } from '@playwright/test';
import path from 'path';

test('front-matter does not persist to slideapp.config until Save', async ({ page }) => {
  // Open the local file
  const filePath = 'file://' + path.resolve(process.cwd(), 'slider.html');
  await page.goto(filePath);

  // Wait for the app to initialize
  await page.waitForSelector('#styleBtn');

  // Prepare a small deck with front-matter that changes primary/accent/textcolor and opacity
  const md = `---\nprimary: "#ff0000"\naccent: "#00ff00"\ntextcolor: "#000000"\nopacity: 50\n---\n\n# FM Test\n\nContent here`;

  // Inject the deck by calling the in-page functions: splitSlides + renderSlides + applyDeckFrontmatter
  await page.evaluate((rawMd) => {
    // Use the global helpers defined in the page
    // Replace slidesHTML/rendering
    // @ts-ignore
    const slidesHTML = splitSlides(rawMd);
    // @ts-ignore
    renderSlides(slidesHTML);
    try{
      // @ts-ignore
      applyDeckFrontmatter(slidesHTML[0].fm || {});
    }catch(e){ console.error('apply fm failed', e); }
  }, md);

  // After front-matter application, check localStorage for 'slideapp.config' (should be null or unchanged)
  const pre = await page.evaluate(() => localStorage.getItem('slideapp.config'));
  expect(pre).toBeNull();

  // Open Style modal and verify UI shows the front-matter values
  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });
  const primaryVal = await page.$eval('#cfgPrimary', el => (el as HTMLInputElement).value);
  const accentVal = await page.$eval('#cfgAccent', el => (el as HTMLInputElement).value);
  const textVal = await page.$eval('#cfgTextColor', el => (el as HTMLInputElement).value);
  const opacityVal = await page.$eval('#cfgSlideOpacity', el => (el as HTMLInputElement).value);
  expect(primaryVal.toLowerCase()).toBe('#ff0000');
  expect(accentVal.toLowerCase()).toBe('#00ff00');
  expect(textVal.toLowerCase()).toBe('#000000');
  expect(Number(opacityVal)).toBe(50);

  // Now click Save in the modal
  await page.click('#cfgSave');
  // Wait briefly for storage write
  await page.waitForTimeout(200);

  const post = await page.evaluate(() => localStorage.getItem('slideapp.config'));
  expect(post).not.toBeNull();
  const cfg = JSON.parse(post as string);
  expect(cfg.primary.toLowerCase()).toBe('#ff0000');
  expect(cfg.accent.toLowerCase()).toBe('#00ff00');
  expect(cfg.textColor.toLowerCase()).toBe('#000000');
  // opacity persisted as decimal
  expect(Math.round((cfg.slideOpacity || 1) * 100)).toBe(50);
});
