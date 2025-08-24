// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');

async function setRangeValue(page, selector, value) {
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, { selector, value });
}

async function getCssVar(page, name) {
  return page.evaluate(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}

function parsePx(v) { const m = /([\d.]+)px/.exec(v||''); return m ? parseFloat(m[1]) : NaN; }
function parseShadowAlpha(v) { const m = /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([0-9.]+)\s*\)/.exec(v||''); return m ? parseFloat(m[1]) : NaN; }

test.describe('Slide visual transparency', () => {
  test('0% opacity removes blur and shadow', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Open style modal and set 0%
    await page.click('#styleBtn');
    await setRangeValue(page, '#cfgSlideOpacity', 0);

    // Read CSS vars
    const blur = await getCssVar(page, '--slide-blur');
    const shadow = await getCssVar(page, '--slide-shadow');

    expect(parsePx(blur)).toBeCloseTo(0, 2);
    expect(parseShadowAlpha(shadow)).toBeCloseTo(0, 3);
  });

  test('37% scales blur and shadow', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Open style modal and set 37%
    await page.click('#styleBtn');
    await setRangeValue(page, '#cfgSlideOpacity', 37);

    // blur: 8 * 0.37 = 2.96
    const blur = await getCssVar(page, '--slide-blur');
    expect(parsePx(blur)).toBeCloseTo(2.96, 2);

    // shadow alpha: 0.25 * 0.37 = 0.0925
    const shadow = await getCssVar(page, '--slide-shadow');
  expect(parseShadowAlpha(shadow)).toBeCloseTo(0.093, 2);
  });
});
