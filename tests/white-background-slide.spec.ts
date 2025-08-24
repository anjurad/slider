// @ts-nocheck
import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p) { return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');
const sampleMdPath = path.resolve(__dirname, '..', 'sample_presentation.md');

async function setInputFilePath(page, selector, absPath){
  await page.setInputFiles(selector, absPath);
}

// Helper to get computed and inline backgrounds of the active slide
async function getActiveSlideBackgrounds(page){
  return page.evaluate(() => {
    const el = document.querySelector('.slide.active');
    if(!el) return { bg: '', bgImage: '', inlineBg: '', styleAttr: '' };
    const cs = getComputedStyle(el);
    return {
      bg: cs.background,
      bgImage: cs.backgroundImage,
      inlineBg: el.style.background,
      styleAttr: el.getAttribute('style') || ''
    };
  });
}

// Navigate to the next slide with a small wait for animation
async function next(page){
  await page.click('#btnNext');
  await page.waitForTimeout(120);
}

// Find the slide index containing text
async function findSlideIndexByText(page, text){
  const slides = await page.locator('.slide').count();
  for(let i=0;i<slides;i++){
    const has = await page.locator('.slide').nth(i).locator('.md').getByText(text, { exact: false }).count();
    if(has>0) return i;
  }
  return -1;
}

// Go to slide index by clicking thumbnail and waiting for content
async function goTo(page, idx, expectText){
  const thumb = page.locator('.thumb').nth(idx);
  await thumb.click();
  if(expectText){
    await expect(page.locator('.slide.active .md')).toContainText(expectText);
  } else {
    await page.waitForTimeout(150);
  }
}

// Extract rgb tuple from css string like 'rgb(255, 255, 255)' or 'rgba(255,255,255,1)'
function parseRgbTuple(s){
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if(!m) return null;
  return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10)];
}

// Parse the linear-gradient and return the first color's rgb tuple
function firstGradientColorRgbTuple(bg){
  // linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)
  const m = bg.match(/linear-gradient\([^,]+,\s*([^,]+),/i);
  if(!m) return null;
  return parseRgbTuple(m[1]);
}

test.describe('White per-slide background', () => {
  test('sample deck has a pure white slide background', async ({ page }) => {
    // Start clean to avoid persisted config interference
    await page.goto(toFileUrl(appPath));
    await page.evaluate(() => localStorage.removeItem('slideapp.config'));
    await page.reload();
    await page.waitForSelector('.slide.active .md');

    await setInputFilePath(page, '#fileInput', sampleMdPath);
    await page.waitForSelector('.slide.active .md');

  // There should be at least two slides with per-slide background overrides in the sample deck
  const totalOverrides = await page.evaluate(() => document.querySelectorAll('.slide[data-slide-bg-override="1"]').length);
  expect(totalOverrides).toBeGreaterThanOrEqual(2);

    // Jump to the slide titled "White Background"
    const targetIdx = await findSlideIndexByText(page, 'White background demo');
    expect(targetIdx).toBeGreaterThanOrEqual(0);
  await goTo(page, targetIdx, 'White background demo');

    // Read computed background and inline style of active slide
    // Prefer deterministic attributes when present
    const hasOverride = await page.locator('.slide.active[data-slide-bg-override="1"]').count();
    if(hasOverride){
      await expect(page.locator('.slide.active')).toHaveAttribute('data-slidebg1', /#fff(?:fff)?/i);
      await expect(page.locator('.slide.active')).toHaveAttribute('data-slidebg2', /#fff(?:fff)?/i);
      return; // attributes verified, no need to parse CSS
    }
    const { bg, bgImage, inlineBg, styleAttr } = await getActiveSlideBackgrounds(page);
    expect(bg || bgImage || inlineBg || styleAttr).toBeTruthy();
  // Accept rgb() or hex or color name in either computed or inline style
    const whitePatterns = [
      /rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/i,                 // rgb(255,255,255)
      /rgb\(\s*255\s+255\s+255(?:\s*\/\s*(?:1(?:\.0+)?|100%))?\s*\)/i, // rgb(255 255 255 / 1)
      /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(?:1(?:\.0+)?|0\.99\d*|100%)\s*\)/i, // rgba(...,1)
      /color\(\s*srgb\s+1(?:\.0+)?\s+1(?:\.0+)?\s+1(?:\.0+)?(?:\s*\/\s*(?:1(?:\.0+)?|100%))?\s*\)/i, // color(srgb 1 1 1 / 1)
      /#fff\b/i,
      /#ffffff\b/i,
      /\bwhite\b/i
    ];
  const hay = [bg, bgImage, inlineBg, styleAttr].join('\n');
  // Must be a linear-gradient override coming from per-slide styles
  expect(/linear-gradient/i.test(hay)).toBeTruthy();
  // Should not reference CSS vars when overridden inline
  expect(/var\(--slide-bg/i.test(hay)).toBeFalsy();
  // And one of the patterns should clearly indicate white
  const isWhite = whitePatterns.some(re => re.test(hay));
  // Fallback: inline style contains explicit white hex or keyword
  const inlineHasWhite = /#fff\b|#ffffff\b|\bwhite\b/i.test(inlineBg || styleAttr);
  expect(isWhite || inlineHasWhite).toBeTruthy();
  });
});
