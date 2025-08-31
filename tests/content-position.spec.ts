import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');

async function getContentAlign(page){
  const vals = await page.evaluate(() => {
    const sc = document.querySelector('.slide.active .content-scroll');
    if(!sc) return { x:'', y:'' };
    const s = getComputedStyle(sc as Element);
    return { x: s.justifyContent, y: s.alignItems };
  });
  return vals as { x: string, y: string };
}

test.describe('Content position', () => {
  test('Deck default MM + per-slide override BR', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(path.resolve(__dirname, 'markdown-content-pos.md'));
    await page.waitForSelector('.slide.active');
    // Slide 1: deck default mm
    let a = await getContentAlign(page);
    expect(a.x).toContain('center');
    expect(a.y).toContain('center');
    // Slide 2: per-slide br
    await page.click('#btnNext');
    await page.waitForTimeout(80);
    a = await getContentAlign(page);
    expect(a.x).toMatch(/flex-end|end/);
    expect(a.y).toMatch(/flex-end|end/);
  });

  test('Style UI persists selection', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');
    // Open Style and choose MR
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.click('#cfgContentPos [data-pos="mr"]');
    await page.click('#cfgSave');
    // Immediate effect
    let a = await getContentAlign(page);
    expect(a.x).toMatch(/flex-end|end/);
    expect(a.y).toMatch(/center/);
    // Reload and verify
    await page.reload();
    await page.waitForSelector('.slide.active');
    a = await getContentAlign(page);
    expect(a.x).toMatch(/flex-end|end/);
    expect(a.y).toMatch(/center/);
  });
});

