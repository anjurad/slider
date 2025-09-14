import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Button Fill live preview and persistence', () => {
  test('Outline applies immediately and persists across Save and reload', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));

    // Open Style UI
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });

    // Choose Outline in Fill dropdown
    await page.selectOption('#cfgBtnFill', 'outline');

    // While modal is open, Style button should reflect outlined style
    const stylesOutlineLive = await page.evaluate(() => {
      const b = document.getElementById('styleBtn')!;
      const cs = getComputedStyle(b);
      return { bg: cs.backgroundImage, bw: cs.borderWidth };
    });
    expect(stylesOutlineLive.bg).toBe('none');
    expect(stylesOutlineLive.bw).toBe('2px');

    // Save and close
    await page.click('#cfgSave');
    await expect(page.locator('#cfgModal')).toBeHidden();

    // Persist in UI
    const stylesAfterSave = await page.evaluate(() => {
      const b = document.getElementById('styleBtn')!;
      const cs = getComputedStyle(b);
      return { bg: cs.backgroundImage, bw: cs.borderWidth };
    });
    expect(stylesAfterSave.bg).toBe('none');
    expect(stylesAfterSave.bw).toBe('2px');

    // Re-open Style to ensure selection persisted
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    const fillValue = await page.$eval('#cfgBtnFill', (el: HTMLSelectElement) => el.value);
    expect(fillValue).toBe('outline');
    await page.click('#cfgSave');

    // Reload: setting should persist
    await page.reload();
    const stylesAfterReload = await page.evaluate(() => {
      const b = document.getElementById('styleBtn')!;
      const cs = getComputedStyle(b);
      return { bg: cs.backgroundImage, bw: cs.borderWidth };
    });
    expect(stylesAfterReload.bg).toBe('none');
    expect(stylesAfterReload.bw).toBe('2px');

    // Toggle back to Solid and verify persistence
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.selectOption('#cfgBtnFill', 'solid');
    await page.click('#cfgSave');
    const stylesSolid = await page.evaluate(() => {
      const b = document.getElementById('styleBtn')!;
      const cs = getComputedStyle(b);
      return { bg: cs.backgroundImage, bw: cs.borderWidth };
    });
    expect(stylesSolid.bg).not.toBe('none');
    expect(stylesSolid.bw).toBe('1px');
  });
});

