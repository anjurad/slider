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

    // Move mouse away from button to avoid hover state before checking styles
    await page.mouse.move(-100, -100);
    await page.waitForTimeout(300);

    // While modal is open, Style button should reflect outlined style
    const stylesOutlineLive = await page.evaluate(() => {
      const b = document.getElementById('styleBtn')!;
      b.blur(); // Clear focus state
      const cs = getComputedStyle(b);
      return { bg: cs.backgroundImage, bw: cs.borderWidth };
    });
    expect(String(stylesOutlineLive.bg || '')).toMatch(/none|rgba/i);
    expect(stylesOutlineLive.bw).toBe('1px');

    // Save and close
    await page.click('#cfgSave');
    await expect(page.locator('#cfgModal')).toBeHidden();

    // Persist in UI
    // Move mouse away from button to avoid hover state before checking styles
    await page.mouse.move(-100, -100);
    await page.waitForTimeout(300);
    
    const stylesAfterSave = await page.evaluate(() => {
      const b = document.getElementById('styleBtn')!;
      b.blur(); // Clear focus state
      const cs = getComputedStyle(b);
      return { bg: cs.backgroundImage, bw: cs.borderWidth };
    });
    expect(String(stylesAfterSave.bg || '')).toMatch(/none|rgba/i);
    expect(stylesAfterSave.bw).toBe('1px');

    // Re-open Style to ensure selection persisted
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    const fillValue = await page.$eval('#cfgBtnFill', (el: HTMLSelectElement) => el.value);
    expect(fillValue).toBe('outline');
    await page.click('#cfgSave');

    // Reload: setting should persist
    await page.reload();
    
    // Move mouse away from button to avoid hover state before checking styles
    await page.mouse.move(-100, -100);
    await page.waitForTimeout(300);
    
    const stylesAfterReload = await page.evaluate(() => {
      const b = document.getElementById('styleBtn')!;
      b.blur(); // Clear focus state
      const cs = getComputedStyle(b);
      return { bg: cs.backgroundImage, bw: cs.borderWidth };
    });
    expect(String(stylesAfterReload.bg || '')).toMatch(/none|rgba/i);
    expect(stylesAfterReload.bw).toBe('1px');

    // Toggle back to Solid and verify persistence
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.selectOption('#cfgBtnFill', 'solid');
    await page.click('#cfgSave');
    
    // Move mouse away from button to avoid hover state before checking styles
    await page.mouse.move(-100, -100);
    await page.waitForTimeout(300);
    // Click on page body to ensure all focus is cleared
    await page.click('body');
    await page.waitForTimeout(100);
    
    const stylesSolid = await page.evaluate(() => {
      const b = document.getElementById('styleBtn')!;
      b.blur(); // Clear focus state
      const root = document.documentElement;
      const cs = getComputedStyle(root);
      return {
        bg: cs.getPropertyValue('--btn-bg'),
        bw: cs.getPropertyValue('--btn-border-width')
      };
    });
    expect(stylesSolid.bg).not.toBe('transparent');
    expect(stylesSolid.bw).toBe('1px');
  });
});
