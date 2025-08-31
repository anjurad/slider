// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

async function getCssVar(page, name){
  return page.evaluate(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}
function parseAlpha(v){ const m = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/.exec(v||''); return m ? parseFloat(m[1]) : NaN; }
function parsePx(v){ const m = /([\d.]+)px/.exec(v||''); return m ? parseFloat(m[1]) : NaN; }

test.describe('T key opacity toggle', () => {
  test('toggles 100% ⇄ 0% and updates CSS vars', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Start at default 100%
    let bg1 = await getCssVar(page, '--slide-bg1');
    let bg2 = await getCssVar(page, '--slide-bg2');
    expect(parseAlpha(bg1)).toBeCloseTo(0.75, 2);
    expect(parseAlpha(bg2)).toBeCloseTo(0.55, 2);
    expect(parsePx(await getCssVar(page, '--slide-blur'))).toBeCloseTo(8, 1);

    // T -> 0%
    await page.keyboard.press('KeyT');
    bg1 = await getCssVar(page, '--slide-bg1');
    bg2 = await getCssVar(page, '--slide-bg2');
    expect(parseAlpha(bg1)).toBeCloseTo(0, 3);
    expect(parseAlpha(bg2)).toBeCloseTo(0, 3);
    expect(parsePx(await getCssVar(page, '--slide-blur'))).toBeCloseTo(0, 2);

    // T -> back to 100%
    await page.keyboard.press('KeyT');
    bg1 = await getCssVar(page, '--slide-bg1');
    bg2 = await getCssVar(page, '--slide-bg2');
    expect(parseAlpha(bg1)).toBeCloseTo(0.75, 2);
    expect(parseAlpha(bg2)).toBeCloseTo(0.55, 2);
  });

  test('updates Style modal slider/readout when open', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');
    await page.click('#styleBtn');

    // Initially 100%
    await expect(page.locator('#cfgSlideOpacity')).toHaveJSProperty('value', '100');
    await expect(page.locator('#cfgSlideOpacityVal')).toHaveText('(100%)');

    // T -> 0%
    await page.keyboard.press('KeyT');
    await expect(page.locator('#cfgSlideOpacity')).toHaveJSProperty('value', '0');
    await expect(page.locator('#cfgSlideOpacityVal')).toHaveText('(0%)');

    // T -> 100%
    await page.keyboard.press('KeyT');
    await expect(page.locator('#cfgSlideOpacity')).toHaveJSProperty('value', '100');
    await expect(page.locator('#cfgSlideOpacityVal')).toHaveText('(100%)');
  });

  test('session-only: toggle to 0% then reload restores default 100%', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');
    await page.keyboard.press('KeyT'); // 0%
    await page.reload();
    // Expect 100%
    const a1 = parseAlpha(await getCssVar(page, '--slide-bg1'));
    const a2 = parseAlpha(await getCssVar(page, '--slide-bg2'));
    expect(a1).toBeCloseTo(0.75, 2);
    expect(a2).toBeCloseTo(0.55, 2);
  });

  test('works with UI-off', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');
    await page.keyboard.press('KeyU'); // UI off
    await page.keyboard.press('KeyT'); // 0%
    let a1 = parseAlpha(await getCssVar(page, '--slide-bg1'));
    let a2 = parseAlpha(await getCssVar(page, '--slide-bg2'));
    expect(a1).toBeCloseTo(0, 3);
    expect(a2).toBeCloseTo(0, 3);
    await page.keyboard.press('KeyT'); // 100%
    a1 = parseAlpha(await getCssVar(page, '--slide-bg1'));
    a2 = parseAlpha(await getCssVar(page, '--slide-bg2'));
    expect(a1).toBeCloseTo(0.75, 2);
    expect(a2).toBeCloseTo(0.55, 2);
  });
});
