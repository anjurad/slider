import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test('Toolbar button shape remains stable when toggling Slides', async ({ page }) => {
  const appPath = path.resolve(__dirname, '..', 'slider.html');
  await page.goto(toFileUrl(appPath) + '?deck=content/demo.md');

  // Target a representative toolbar button (Style)
  const styleBtn = page.getByRole('button', { name: 'Style' });
  await expect(styleBtn).toBeVisible();

  const readGeom = async () => {
    return await styleBtn.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        h: Math.round(parseFloat(cs.height || '0')),
        r: cs.borderRadius,
        pad: cs.padding
      };
    });
  };

  const before = await readGeom();

  // Toggle Slides drawer open and closed
  await page.locator('#drawerBtn').click();
  await page.waitForTimeout(200);
  await page.locator('#drawerBtn').click();
  await page.waitForTimeout(200);

  const after = await readGeom();

  // Assert geometry stable
  expect(after.h).toBe(before.h);
  expect(after.r).toBe(before.r);
  expect(after.pad).toBe(before.pad);
});
