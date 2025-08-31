import { test, expect } from '@playwright/test';
function fileUrl(path: string) {
  const p = require('path');
  return 'file://' + p.resolve(path);
}

async function setRangeValue(page, selector: string, value: number){
  await page.locator(selector).evaluate((el, v)=>{
    (el as HTMLInputElement).value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test.describe('Style sliders stability', () => {
  test('Title size slider does not reset overlay controls', async ({ page }) => {
    await page.goto(fileUrl('slider.html'));
    await page.click('#styleBtn');

    // Enable overlay and pick TR
    const cb = page.locator('#cfgOverlayTitleOn');
    await cb.check();
    await page.click('#cfgOverlayPos [data-pos="tr"]');
    const trBtn = page.locator('#cfgOverlayPos [data-pos="tr"]');
    await expect(trBtn).toHaveAttribute('aria-pressed', 'true');

    // Move title size slider and ensure button state remains
    await setRangeValue(page, '#cfgTitleSize', 28);
    await expect(trBtn).toHaveAttribute('aria-pressed', 'true');
    // CSS var updated
    const titlePx = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--title-size').trim());
    expect(titlePx).toBe('28px');
  });

  test('Subtitle size slider does not reset overlay controls', async ({ page }) => {
    await page.goto(fileUrl('slider.html'));
    await page.click('#styleBtn');

    // Enable overlay and pick BL
    const cb = page.locator('#cfgOverlayTitleOn');
    await cb.check();
    await page.click('#cfgOverlayPos [data-pos="bl"]');
    const blBtn = page.locator('#cfgOverlayPos [data-pos="bl"]');
    await expect(blBtn).toHaveAttribute('aria-pressed', 'true');

    // Move subtitle size slider and ensure button state remains
    await setRangeValue(page, '#cfgSubtitleSize', 18);
    await expect(blBtn).toHaveAttribute('aria-pressed', 'true');
    // CSS var updated
    const subPx = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--subtitle-size').trim());
    expect(subPx).toBe('18px');
  });
});
