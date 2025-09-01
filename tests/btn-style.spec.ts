import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Button styles', () => {
  test('Custom button text color + outline fill apply and persist in session', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));
    await page.evaluate(() => { (document.getElementById('styleBtn') as HTMLButtonElement)?.click(); });
    await expect(page.locator('#cfgModal')).toBeVisible();

    // Set custom button text color
    await page.locator('#cfgBtnTextMode').waitFor({ state: 'visible' });
    await page.evaluate(() => {
      const sel = document.getElementById('cfgBtnTextMode') as HTMLSelectElement | null;
      if (sel) {
        sel.value = 'custom';
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await expect(page.locator('#cfgBtnTextColor')).toBeEnabled();
    // Set color value and dispatch input to trigger live preview
    await page.evaluate(() => {
      const clr = document.getElementById('cfgBtnTextColor') as HTMLInputElement | null;
      if (clr){ clr.value = '#ff00ff'; clr.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    // Switch to outline fill
    await page.locator('#cfgBtnFill').selectOption('outline');
    await page.getByRole('button', { name: 'Save' }).click();

    const styleBtn = page.getByRole('button', { name: 'Style' });
    const color = await styleBtn.evaluate(el => getComputedStyle(el).color);
    expect(color.replace(/\s+/g,'')).toMatch(/rgb\(255,0,255\)/);

    // Outline: background should be transparent (no background-image)
    const bgImg = await styleBtn.evaluate(el => getComputedStyle(el).backgroundImage);
    expect(bgImg).toBe('none');

    // Re-open Style and verify modal buttons reflect the same text color immediately
    await page.evaluate(() => { (document.getElementById('styleBtn') as HTMLButtonElement)?.click(); });
    await expect(page.locator('#cfgModal')).toBeVisible();
    const modalBtnColor = await page.locator('#cfgLoadUrl').evaluate(el => getComputedStyle(el).color);
    expect(modalBtnColor.replace(/\s+/g,'')).toMatch(/rgb\(255,0,255\)/);
  });
});
