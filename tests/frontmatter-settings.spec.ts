import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

test('deck-level frontmatter settings are applied (transient) and honored in UI', async ({ page }) => {
  await page.goto(toFileUrl(appPath));
  await page.waitForSelector('#styleBtn');
  // Ensure no persisted config interferes
  await page.evaluate(() => localStorage.removeItem('slideapp.config'));

  // Build a small deck with deck-level frontmatter for styles
  const md = `---\nappname: TestDeck\nprimary: "#ff8800"\naccent: "#00cc88"\ntextcolor: "#001122"\nappbg1: "#112233"\nappbg2: "#223344"\nopacity: 60\nbackground: gradient\n---\n# Hello\n\n---\n# Slide 2\n`;

  // Inject via in-page helpers: splitSlides + renderSlides + applyDeckFrontmatter
  await page.evaluate((raw)=>{
    // @ts-ignore
    const slides = splitSlides(raw);
    // @ts-ignore
    renderSlides(slides);
    try{ // @ts-ignore
      applyDeckFrontmatter(slides[0].fm || {});
    }catch(e){ console.error('apply fm err', e); }
  }, md);

  // After frontmatter, localStorage should still be empty for slideapp.config
  const pre = await page.evaluate(() => localStorage.getItem('slideapp.config'));
  expect(pre).toBeNull();

  // Open Style modal and check inputs reflect frontmatter values
  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });
  const primary = await page.$eval('#cfgPrimary', el => (el as HTMLInputElement).value);
  const accent = await page.$eval('#cfgAccent', el => (el as HTMLInputElement).value);
  const text = await page.$eval('#cfgTextColor', el => (el as HTMLInputElement).value);
  const app1 = await page.$eval('#cfgAppBg1', el => (el as HTMLInputElement).value);
  const app2 = await page.$eval('#cfgAppBg2', el => (el as HTMLInputElement).value);
  const opacity = await page.$eval('#cfgSlideOpacity', el => (el as HTMLInputElement).value);

  expect(primary.toLowerCase()).toBe('#ff8800');
  expect(accent.toLowerCase()).toBe('#00cc88');
  expect(text.toLowerCase()).toBe('#001122');
  expect(app1.toLowerCase()).toBe('#112233');
  expect(app2.toLowerCase()).toBe('#223344');
  expect(Number(opacity)).toBe(60);

  // Close modal without saving
  await page.click('#cfgClose');
});
