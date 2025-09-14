import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Overlay visual vars', () => {
  test('Title/subtitle font sizes reflect Style sliders', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    // Enable overlay and subtitle in Style
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.check('#cfgOverlayTitleOn');
    await page.check('#cfgOverlaySubtitleOn');
    await page.fill('#cfgTitleSize', '30');
    await page.fill('#cfgSubtitleSize', '16');
    await page.click('#cfgSave');

    await page.waitForSelector('.slide.active .slide-overlay');
    const sizes = await page.evaluate(() => {
      const t = document.querySelector('.slide.active .slide-overlay .slide-title') as HTMLElement | null;
      const s = document.querySelector('.slide.active .slide-overlay .slide-subtitle') as HTMLElement | null;
      const ts = t ? getComputedStyle(t).fontSize : '';
      const ss = s ? getComputedStyle(s).fontSize : '';
      return { ts, ss };
    });
    expect(sizes.ts).toBe('30px');
    expect(sizes.ss).toBe('16px');
  });
});

