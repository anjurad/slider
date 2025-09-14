import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Overlay subtitle accent color', () => {
  test('Subtitle color follows --accent when set to accent', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.check('#cfgOverlayTitleOn');
    await page.check('#cfgOverlaySubtitleOn');
    await page.selectOption('#cfgSubtitleColor', 'accent');
    await page.click('#cfgSave');

    await page.waitForSelector('.slide.active .slide-overlay');
    const colors = await page.evaluate(() => {
      function hexToRgbStr(hex){
        if(!hex) return '';
        const h = hex.replace(/^#/, '');
        const v = h.length === 3 ? h.split('').map(c=>c+c).join('') : h;
        const r = parseInt(v.slice(0,2),16), g=parseInt(v.slice(2,4),16), b=parseInt(v.slice(4,6),16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      const rootAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      const expected = hexToRgbStr(rootAccent);
      const sub = document.querySelector('.slide.active .slide-overlay .slide-subtitle') as HTMLElement | null;
      const c = sub ? getComputedStyle(sub).color : '';
      return { expected, c };
    });
    expect(colors.c.replace(/\s+/g,'')).toBe(colors.expected.replace(/\s+/g,''));
  });
});

