import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Outline hover contrast and border width', () => {
  test('Hover increases border width and adjusts color', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));

    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    // Use a vivid accent for visibility
    await page.fill('#cfgAccent', '#00ff00');
    await page.selectOption('#cfgBtnFill', 'outline');
    await page.fill('#cfgBtnBorderWidth', '3');
    await page.click('#cfgSave');

    const styleBtn = page.locator('#styleBtn');
    const normal = await styleBtn.evaluate(el => {
      const cs = getComputedStyle(el);
      return { bw: cs.borderWidth, bc: cs.borderColor };
    });
    expect(normal.bw).toBe('3px');

    await styleBtn.hover();
    const hovered = await styleBtn.evaluate(el => {
      const cs = getComputedStyle(el);
      return { bw: cs.borderWidth, bc: cs.borderColor };
    });
    expect(hovered.bw).toBe('4px');
    expect(hovered.bc.replace(/\s+/g,'')).not.toBe(normal.bc.replace(/\s+/g,''));
  });
});

