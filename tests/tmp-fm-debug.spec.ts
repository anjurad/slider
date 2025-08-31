import { test } from '@playwright/test';
import path from 'path';

test('debug frontmatter variable', async ({ page }) => {
  const app = path.resolve(__dirname, '..', 'slider.html');
  const sample = path.resolve(__dirname, '..', 'sample_presentation.md');
  await page.goto('file://' + app);
  await page.setInputFiles('#fileInput', sample);
  // wait briefly for apply
  await page.waitForTimeout(500);
  const fm = await page.evaluate(() => (window as any).__lastAppliedFrontmatter || null);
  console.log('FM VAR:', fm);
  const bgBtn = await page.locator('#bgBtn').innerText();
  console.log('BG BTN TEXT:', bgBtn);
});
