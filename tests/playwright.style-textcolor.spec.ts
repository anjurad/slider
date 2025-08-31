import { test, expect } from '@playwright/test';
import path from 'path';

test('style modal labels follow configured general text color', async ({ page }) => {
  const htmlPath = path.resolve(__dirname, '..', 'slider.html');
  const url = `file://${htmlPath}`;
  await page.goto(url);

  // Open Style modal
  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });

  // Set the text color picker to a known color and trigger input event
  const color = '#ff8800';
  await page.fill('#cfgTextColor', color);
  await page.dispatchEvent('#cfgTextColor', 'input');

  // Wait for CSS var to propagate
  await page.waitForTimeout(120);

  // Read computed color for a label inside the modal
  const labelColor = await page.evaluate(()=>{
    const lbl = document.querySelector('#cfgModal label');
    if(!lbl) return null;
    return getComputedStyle(lbl).color;
  });

  // Normalize rgb/rgba to hex-ish compare by checking rgb values contain 255,136,0
  expect(labelColor).toBeTruthy();
  expect(/\b255\b/.test(labelColor)).toBeTruthy();
  expect(/\b136\b/.test(labelColor)).toBeTruthy();
  expect(/\b0\b/.test(labelColor)).toBeTruthy();
});
