import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

async function sizeOf(page, selector: string){
  const box = await page.locator(selector).boundingBox();
  return { w: Math.round((box?.width||0)), h: Math.round((box?.height||0)) };
}

test('Overlay position buttons keep size when Title toggles', async ({ page }) => {
  await page.goto(toFileUrl(appPath));
  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });

  const btn = '#cfgOverlayPos [data-pos="tl"]';
  const base = await sizeOf(page, btn);

  // Toggle Title ON then OFF a few times
  for(let i=0;i<3;i++){
    await page.check('#cfgOverlayTitleOn');
    await page.waitForTimeout(50);
    const onSize = await sizeOf(page, btn);
    await page.uncheck('#cfgOverlayTitleOn');
    await page.waitForTimeout(50);
    const offSize = await sizeOf(page, btn);
    // Sizes should remain stable within 1px rounding tolerance
    expect(Math.abs(onSize.w - base.w)).toBeLessThanOrEqual(1);
    expect(Math.abs(onSize.h - base.h)).toBeLessThanOrEqual(1);
    expect(Math.abs(offSize.w - base.w)).toBeLessThanOrEqual(1);
    expect(Math.abs(offSize.h - base.h)).toBeLessThanOrEqual(1);
  }
});

