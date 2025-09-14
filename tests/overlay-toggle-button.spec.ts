import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test('Overlay toggle button shows title overlay with text', async ({ page }) => {
  const appPath = path.resolve(__dirname, '..', 'slider.html');
  await page.goto(toFileUrl(appPath));
  await page.waitForSelector('.slide.active');

  // Ensure default off
  await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(0);

  // Toggle on and expect overlay to render with a title
  await page.click('#overlayBtn');
  await page.waitForSelector('.slide.active .slide-overlay');
  const titleText = await page.locator('.slide.active .slide-overlay .slide-title').first().textContent();
  expect((titleText||'').trim().length).toBeGreaterThan(0);

  // Visual assertion: title color follows --primary
  const colors = await page.evaluate(() => {
    function hexToRgbStr(hex){
      if(!hex) return '';
      const h = hex.replace(/^#/, '');
      const v = h.length === 3 ? h.split('').map(c=>c+c).join('') : h;
      const r = parseInt(v.slice(0,2),16), g=parseInt(v.slice(2,4),16), b=parseInt(v.slice(4,6),16);
      return `rgb(${r}, ${g}, ${b})`;
    }
    const root = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const expected = hexToRgbStr(root);
    const title = getComputedStyle(document.querySelector('.slide.active .slide-overlay .slide-title')).color;
    return { expected, title };
  });
  expect(colors.title.replace(/\s+/g,'')).toBe(colors.expected.replace(/\s+/g,''));
});
