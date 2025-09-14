import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Style Save behavior', () => {
  test('Save applies changes and closes modal', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));

    // Open Style modal
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });

    // Change accent to a distinct value and Save
    await page.fill('#cfgAccent', '#00ff00');
    await page.click('#cfgSave');

    // Modal should close
    await expect(page.locator('#cfgModal')).toBeHidden();

    // Outline pseudo-element should reflect the new accent (rgb(0, 255, 0))
    const boxShadow = await page.$eval('.slide.active', el => getComputedStyle(el, '::before').boxShadow);
    const s = (boxShadow||'').replace(/\s+/g,' ').toLowerCase();
    expect(s).toContain('rgb(0, 255, 0)');
    expect(s).toContain('inset');
  });
});

