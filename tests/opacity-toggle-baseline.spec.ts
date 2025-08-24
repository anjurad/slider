// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');

async function getCssVar(page, name){
  return page.evaluate(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}
function parseAlpha(v){ const m = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/.exec(v||''); return m ? parseFloat(m[1]) : NaN; }

async function setRangeValue(page, selector, value) {
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, { selector, value });
}

async function clearConfig(page) {
  await page.goto(toFileUrl(appPath));
  await page.evaluate(() => localStorage.removeItem('slideapp.config'));
}

test.describe('T key toggles 0% ⇄ saved baseline', () => {
  test('baseline = 37% after save; T cycles 0% ⇄ 37%', async ({ page }) => {
    await clearConfig(page);
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Open Style and set 37%
    await page.click('#styleBtn');
    await setRangeValue(page, '#cfgSlideOpacity', 37);
    await expect(page.locator('#cfgSlideOpacityVal')).toHaveText('(37%)');

    // Save updates baseline
    await page.click('#cfgSave');

    // Ensure starting at baseline visually
    let a1 = parseAlpha(await getCssVar(page, '--slide-bg1'));
    let a2 = parseAlpha(await getCssVar(page, '--slide-bg2'));
    expect(a1).toBeCloseTo(0.278, 2); // 0.75 * 0.37
    expect(a2).toBeCloseTo(0.204, 2); // 0.55 * 0.37

    // T -> 0%
    await page.keyboard.press('KeyT');
    a1 = parseAlpha(await getCssVar(page, '--slide-bg1'));
    a2 = parseAlpha(await getCssVar(page, '--slide-bg2'));
    expect(a1).toBeCloseTo(0, 3);
    expect(a2).toBeCloseTo(0, 3);

    // T -> back to baseline 37%
    await page.keyboard.press('KeyT');
    a1 = parseAlpha(await getCssVar(page, '--slide-bg1'));
    a2 = parseAlpha(await getCssVar(page, '--slide-bg2'));
    expect(a1).toBeCloseTo(0.278, 2);
    expect(a2).toBeCloseTo(0.204, 2);
  });

  test('Reset sets baseline to 100%; T cycles 0% ⇄ 100%', async ({ page }) => {
    await clearConfig(page);
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Set 37% and Save to ensure baseline change
    await page.click('#styleBtn');
    await setRangeValue(page, '#cfgSlideOpacity', 37);
    await page.click('#cfgSave');

    // Re-open and Reset
    await page.click('#styleBtn');
    await page.click('#cfgReset');

    // After reload (triggered by reset), app should be at default
    await page.waitForSelector('.slide.active .md');

    // T -> 0%
    await page.keyboard.press('KeyT');
    let a1 = parseAlpha(await getCssVar(page, '--slide-bg1'));
    let a2 = parseAlpha(await getCssVar(page, '--slide-bg2'));
    expect(a1).toBeCloseTo(0, 3);
    expect(a2).toBeCloseTo(0, 3);

    // T -> back to 100%
    await page.keyboard.press('KeyT');
    a1 = parseAlpha(await getCssVar(page, '--slide-bg1'));
    a2 = parseAlpha(await getCssVar(page, '--slide-bg2'));
    expect(a1).toBeCloseTo(0.75, 2);
    expect(a2).toBeCloseTo(0.55, 2);
  });
});
