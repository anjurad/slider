// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

async function getBeforeBoxShadow(page, selector){
  // Read the pseudo-element box-shadow by injecting a tiny script
  return page.$eval(selector, el => getComputedStyle(el, '::before').boxShadow);
}

async function setColor(page, selector, value){
  await page.fill(selector, value);
}

function norm(s){ return (s||'').replace(/\s+/g,' ').toLowerCase(); }

function expectShadowHasAccent(shadow, accentRgb){
  // Accept either ordering: 'inset 0 0 0 3px rgb(...)' or 'rgb(...) 0px 0px 0px 3px inset'
  const s = norm(shadow);
  expect(s).toContain(accentRgb);
  expect(s).toContain('inset');
  expect(s).toContain('0px 0px 0px 3px');
}

test.describe('Slide outline', () => {
  test('default outline is on and uses accent color', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');
    const shadow = await getBeforeBoxShadow(page, '.slide.active');
  // default accent is #64fffc => rgb(100, 255, 252)
  expectShadowHasAccent(shadow, 'rgb(100, 255, 252)');
  });

  test('outline follows accent after save', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    await page.click('#styleBtn');
    await setColor(page, '#cfgAccent', '#00ff00'); // lime
    await page.click('#cfgSave');

    const shadow = await getBeforeBoxShadow(page, '.slide.active');
    expectShadowHasAccent(shadow, 'rgb(0, 255, 0)');
  });

  test('hotkey O toggles outline and syncs with Style checkbox', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    // Ensure visible first
    let shadow = await getBeforeBoxShadow(page, '.slide.active');
    expect(norm(shadow)).not.toBe('none');

    // O -> hide
    await page.keyboard.press('KeyO');
    shadow = await getBeforeBoxShadow(page, '.slide.active');
    expect(norm(shadow)).toBe('none');

    // Open Style and check the checkbox is off
    await page.click('#styleBtn');
    await expect(page.locator('#cfgSlideOutline')).toHaveJSProperty('checked', false);

    // Toggle back on via checkbox, closes with Save
    await page.click('#cfgSlideOutline');
    await page.click('#cfgSave');

    // Should be visible again
    shadow = await getBeforeBoxShadow(page, '.slide.active');
    expect(norm(shadow)).not.toBe('none');
  });

  test('persistence: Save keeps outline state; Reset restores default on', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    // Turn off via Style and Save
    await page.click('#styleBtn');
    await page.uncheck('#cfgSlideOutline');
    await page.click('#cfgSave');
    await page.reload();

    // Should remain off
    let shadow = await getBeforeBoxShadow(page, '.slide.active');
    expect(norm(shadow)).toBe('none');

    // Reset to defaults
    await page.click('#styleBtn');
    await page.click('#cfgReset');

    await page.waitForSelector('.slide.active');
    // Wait until outline is applied (avoid timing flake on reload)
    await page.waitForFunction(() => {
      const el = document.querySelector('.slide.active');
      if(!el) return false;
      return getComputedStyle(el, '::before').boxShadow !== 'none';
    });
    shadow = await getBeforeBoxShadow(page, '.slide.active');
    expect(norm(shadow)).not.toBe('none');
  });

  test('works with UI-off', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');
    await page.keyboard.press('KeyU'); // UI off

    // Toggle outline with O while UI off
    await page.keyboard.press('KeyO');
    let shadow = await getBeforeBoxShadow(page, '.slide.active');
    expect(norm(shadow)).toBe('none');

    await page.keyboard.press('KeyO');
    shadow = await getBeforeBoxShadow(page, '.slide.active');
    expect(norm(shadow)).not.toBe('none');
  });
});
