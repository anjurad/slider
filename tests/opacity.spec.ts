// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) {
  const abs = path.resolve(p);
  return 'file://' + abs;
}

async function setRangeValue(page, selector: string, value: number) {
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector<HTMLInputElement>(selector)!;
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, { selector, value });
}

async function getCssVarAlpha(page, varName: string) {
  const v = await page.evaluate((name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(), varName);
  // Expect format like rgba(17,24,39,0.278)
  const m = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/.exec(v);
  return m ? parseFloat(m[1]) : NaN;
}

const appPath = path.resolve(__dirname, '..', 'slider.html');

// Clean slate per test to avoid cross-test storage interference
async function clearConfig(page) {
  await page.goto(toFileUrl(appPath));
  await page.evaluate(() => {
    localStorage.removeItem('slider.config');
  });
}

test.describe('Slide background opacity persistence (WebKit)', () => {
  test('persists 0% after save and reload', async ({ page }) => {
    await clearConfig(page);
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Open Style modal
    await page.click('#styleBtn');

    // Set to 0% and ensure readout updates
    await setRangeValue(page, '#cfgSlideOpacity', 0);
    await expect(page.locator('#cfgSlideOpacityVal')).toHaveText('(0%)');

    // Save
    await page.click('#cfgSave');

    // Reload and verify persistence
    await page.reload();
    await page.waitForSelector('.slide.active .md');
    await page.click('#styleBtn');

    await expect(page.locator('#cfgSlideOpacity')).toHaveJSProperty('value', '0');
    await expect(page.locator('#cfgSlideOpacityVal')).toHaveText('(0%)');

    // CSS variables should be fully transparent
    const a1 = await getCssVarAlpha(page, '--slide-bg1');
    const a2 = await getCssVarAlpha(page, '--slide-bg2');
    expect(a1).toBeCloseTo(0, 3);
    expect(a2).toBeCloseTo(0, 3);
  });

  test('persists arbitrary 37% after save and reload', async ({ page }) => {
    await clearConfig(page);
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');

    // Open Style modal
    await page.click('#styleBtn');

    // Set to 37%
    await setRangeValue(page, '#cfgSlideOpacity', 37);
    await expect(page.locator('#cfgSlideOpacityVal')).toHaveText('(37%)');

    // Save and reload
    await page.click('#cfgSave');
    await page.reload();
    await page.waitForSelector('.slide.active .md');

    // Re-open modal and assert slider value and readout
    await page.click('#styleBtn');
    await expect(page.locator('#cfgSlideOpacity')).toHaveJSProperty('value', '37');
    await expect(page.locator('#cfgSlideOpacityVal')).toHaveText('(37%)');

    // CSS var alphas should reflect base scaling with rounding to 3 decimals
    // base1 = 0.75 -> 0.75 * 0.37 = 0.2775 => 0.278
    // base2 = 0.55 -> 0.55 * 0.37 = 0.2035 => 0.204
    const a1 = await getCssVarAlpha(page, '--slide-bg1');
    const a2 = await getCssVarAlpha(page, '--slide-bg2');
  expect(a1).toBeCloseTo(0.278, 2);
  expect(a2).toBeCloseTo(0.204, 2);
  });
});
