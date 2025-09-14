import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Button Fill dropdown', () => {
  test('Switching fill to outline applies transparent background; solid restores gradient', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));

    // Open Style modal
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });

    // Change accent to a distinct color, set Fill to outline and Save
    await page.fill('#cfgAccent', '#00ff00');
    await page.selectOption('#cfgBtnFill', 'outline');
    await page.click('#cfgSave');

    const styleBtn = page.getByRole('button', { name: 'Style' });
            // Move mouse away from buttons to avoid hover state
    await page.mouse.move(-100, -100);
    await page.waitForTimeout(300);
    await styleBtn.evaluate(el => el.blur());
    const stylesOutline = await styleBtn.evaluate(el => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundImage, bw: cs.borderWidth, bc: cs.borderColor };
    });
    expect(stylesOutline.bg).toBe('none');
    expect(stylesOutline.bw).toBe('2px');
    expect(stylesOutline.bc.replace(/\s+/g,'')).toMatch(/rgb\(0,255,0\)/);

    // Re-open Style, switch to solid and Save
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.selectOption('#cfgBtnFill', 'solid');
    await page.click('#cfgSave');

    // Blur the button to clear focus state before checking styles
    await page.mouse.move(-100, -100);
    await page.waitForTimeout(300);
    await styleBtn.evaluate(el => el.blur());
    // Click on page body to ensure all focus is cleared
    await page.click('body');
    await page.waitForTimeout(100);
    const stylesSolid = await page.evaluate(() => {
      const root = document.documentElement;
      const cs = getComputedStyle(root);
      return {
        bg: cs.getPropertyValue('--btn-bg'),
        bw: cs.getPropertyValue('--btn-border-width')
      };
    });
    // Should not be 'none' (gradient set via --btn-bg) and border thinner
    expect(stylesSolid.bg).not.toBe('transparent');
    expect(stylesSolid.bw).toBe('1px');

    // Re-open Style and ensure the dropdown persisted last selection
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    const fillValue = await page.$eval('#cfgBtnFill', (el: HTMLSelectElement) => el.value);
    expect(fillValue).toBe('solid');
  });
});
