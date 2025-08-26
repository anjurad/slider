// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');
const sampleMdPath = path.resolve(__dirname, '..', 'sample_presentation.md');

async function setInputFilePath(page, selector, absPath){
  await page.setInputFiles(selector, absPath);
}

test.describe('Sample deck frontmatter application', () => {
  test('Loading sample_presentation.md applies frontmatter settings', async ({ page }) => {
  // Start with a clean config to avoid interference
  await page.goto(toFileUrl(appPath));
  // Ensure previous runs haven't left background mode set in localStorage
  await page.evaluate(() => {
    localStorage.removeItem('slideapp.config');
    localStorage.removeItem('bgMode');
  });
  // Reload to ensure a fresh app instance, then opt-in deterministic test mode in the new page
  await page.reload();
  await page.evaluate(() => {
    try { window.__SLIDEAPP_TEST_DETERMINISTIC = true; } catch(e){ console.warn('deterministic flag set failed', String(e)); }
    try { localStorage.removeItem('bgMode'); } catch(e){ console.warn('clear bgMode failed', String(e)); }
  });
    await page.waitForSelector('.slide.active .md');

    // Load the actual sample file from workspace
    await setInputFilePath(page, '#fileInput', sampleMdPath);

  // Background mode expectation: determine from the sample file's frontmatter below

    // App name applied based on sample frontmatter (brand/appname)
  const md = fs.readFileSync(sampleMdPath, 'utf8');
  const fmMatch = md.trimStart().match(/^---[\s\S]*?---/);
    let expectedName = 'SlideApp';
    if(fmMatch){
      const block = fmMatch[0];
      const lines = block.split(/\r?\n/).slice(1,-1);
      const kv = {} as Record<string,string>;
      for(const ln of lines){
        const m = ln.match(/^([^:#]+):\s*(.*)$/);
        if(m){ kv[m[1].trim().toLowerCase()] = m[2].trim().replace(/^"|"$/g,''); }
      }
  expectedName = (kv['appname'] || kv['app-name'] || kv['brand'] || expectedName).trim();
    }
    await expect(page.locator('#appName')).toHaveText(new RegExp(expectedName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'i'));

  // Colors applied to CSS variables
  const primary = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim());
  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
  expect(primary.toLowerCase()).toBe('#01b4e1');
  expect(accent.toLowerCase()).toBe('#64fffc');

    // Opacity applied per sample frontmatter (check CSS var alphas derived dynamically)
    const bg1 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--slide-bg1').trim());
    const bg2 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--slide-bg2').trim());
    // Parse opacity from sample fm
    let expectedDec = 1;
  const fmBlock = md.trimStart().match(/^---[\s\S]*?---/);
    if(fmBlock){
      const block = fmBlock[0];
      const m = block.match(/\n\s*opacity\s*:\s*([^\n]+)/i) || block.match(/\n\s*slideopacity\s*:\s*([^\n]+)/i);
      if(m){
        const raw = m[1].trim();
        if(/%$/.test(raw)){
          const pct = parseFloat(raw.replace(/%/g,''));
          if(isFinite(pct)) expectedDec = Math.max(0, Math.min(1, Math.round(pct) / 100));
        } else {
          const num = parseFloat(raw);
          if(isFinite(num)) expectedDec = num <= 1 ? Math.max(0, Math.min(1, num)) : Math.max(0, Math.min(1, Math.round(num)/100));
        }
      }
    }
    const exp1 = (0.75 * expectedDec).toFixed(3).replace(/0+$/,'0');
    const exp2 = (0.55 * expectedDec).toFixed(3).replace(/0+$/,'0');
    const re1 = new RegExp(`rgba\\(\\s*17\\s*,\\s*24\\s*,\\s*39\\s*,\\s*${exp1.replace('.', '\\.')}\\s*\\)`);
    const re2 = new RegExp(`rgba\\(\\s*17\\s*,\\s*24\\s*,\\s*39\\s*,\\s*${exp2.replace('.', '\\.')}\\s*\\)`);
    expect(bg1).toMatch(re1);
    expect(bg2).toMatch(re2);

    // Determine expected background from frontmatter (if present) and assert accordingly
    let expectedBg = 'gradient';
    if(fmBlock){
      const bmatch = fmBlock[0].match(/\n\s*background\s*:\s*([^\n]+)/i);
      if(bmatch){
        const raw = bmatch[1].trim().replace(/^"|"$/g,'');
        if(/^particles$/i.test(raw)) expectedBg = 'particles';
        else if(/^off$/i.test(raw)) expectedBg = 'off';
        else if(/^gradient$/i.test(raw)) expectedBg = 'gradient';
      }
    }
    if(expectedBg === 'particles'){
      await expect(page.locator('#bgBtn')).toHaveText(/Particles|✨/i, { timeout: 8000 });
    } else if(expectedBg === 'off'){
      await expect(page.locator('#bgBtn')).toHaveText(/Off|⛔/i, { timeout: 8000 });
    } else {
      await expect(page.locator('#bgBtn')).toHaveText(/Background|🌌/i, { timeout: 8000 });
    }

  // UI mode 'on' should keep header/footer visible
  await expect(page.locator('.deck-header')).toBeVisible();
  await expect(page.locator('.deck-footer')).toBeVisible();
  });
});
