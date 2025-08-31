import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) { return 'file://' + path.resolve(p); }

const appPath = path.resolve(__dirname, '..', 'slider.html');

// Helper to count overlays on current active slide
async function overlayInfo(page) {
  const hasOverlay = await page.locator('.slide.active .slide-overlay').count();
  const titleText = await page.locator('.slide.active .slide-overlay .slide-title').first().textContent().catch((e) => { if(typeof console !== 'undefined' && console.debug) console.debug('overlay.titleText catch', e && e.message); return ''; });
  const subtitleText = await page.locator('.slide.active .slide-overlay .slide-subtitle').first().textContent().catch((e) => { if(typeof console !== 'undefined' && console.debug) console.debug('overlay.subtitleText catch', e && e.message); return ''; });
  const classList = await page.locator('.slide.active .slide-overlay').first().getAttribute('class').catch((e) => { if(typeof console !== 'undefined' && console.debug) console.debug('overlay.classList catch', e && e.message); return ''; });
  const styles = {
  titleSize: await page.evaluate(() => { const el = document.querySelector('.slide.active .slide-overlay .slide-title'); return el ? getComputedStyle(el).fontSize : ''; }).catch((e) => { if(typeof console !== 'undefined' && console.debug) console.debug('overlay.titleSize catch', e && e.message); return ''; }),
  subtitleSize: await page.evaluate(() => { const el = document.querySelector('.slide.active .slide-overlay .slide-subtitle'); return el ? getComputedStyle(el).fontSize : ''; }).catch((e) => { if(typeof console !== 'undefined' && console.debug) console.debug('overlay.subtitleSize catch', e && e.message); return ''; }),
  subtitleColor: await page.evaluate(() => { const el = document.querySelector('.slide.active .slide-overlay .slide-subtitle'); return el ? getComputedStyle(el).color : ''; }).catch((e) => { if(typeof console !== 'undefined' && console.debug) console.debug('overlay.subtitleColor catch', e && e.message); return ''; }),
  };
  return { hasOverlay, titleText, subtitleText, classList, styles };
}

test.describe('Overlay title/subtitle', () => {
  test('default is OFF; enabling via Style shows overlays', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');

    // Default off: no overlay
    await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(0);

    // Open Style and enable overlay + subtitles
    await page.click('#styleBtn');
    await page.waitForSelector('#cfgModal', { state: 'visible' });
    await page.check('#cfgOverlayTitleOn');
    await page.check('#cfgOverlaySubtitleOn');

    // Save
    await page.click('#cfgSave');

    // Overlay should appear with default position (tl)
    await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(1);
    await expect(page.locator('.slide.active .slide-overlay')).toHaveClass(/pos-tl/);

    // Subtitle rendered only if present; demo first slide has h1 body only, no frontmatter title
    // Move to a slide with a frontmatter title in demo (Quick Start)
    for (let i = 0; i < 6; i++) {
      await page.click('#btnNext');
      await page.waitForTimeout(80);
      const has = await page.locator('.slide.active .slide-overlay').count();
      if (has > 0) break;
    }
    await expect(page.locator('.slide.active .slide-overlay .slide-title')).toHaveCount(1);
    // Wait for title and subtitle elements to be attached and visible before measuring
    await page.waitForSelector('.slide.active .slide-overlay .slide-title', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('.slide.active .slide-overlay .slide-subtitle', { state: 'attached', timeout: 2000 }).catch(() => {});
    // Subtitle should be thinner than title
    const weights = await page.evaluate(() => {
      const titleEl = document.querySelector('.slide.active .slide-overlay .slide-title');
      const subEl = document.querySelector('.slide.active .slide-overlay .slide-subtitle');
      const t = titleEl ? getComputedStyle(titleEl as Element).fontWeight : '';
      const s = subEl ? getComputedStyle(subEl as Element).fontWeight : '';
      const parse = (w: string) => parseInt(w, 10) || 0;
      return { tw: parse(t), sw: parse(s) };
    });
    expect(weights.sw).toBeLessThan(weights.tw);
  });

  test('deck-level overlay settings + sizes + accent subtitle', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
  await chooser.setInputFiles(path.resolve(__dirname, 'markdown-overlay.md'));
    await page.waitForSelector('.slide.active');

  // First visible slide is deck-level frontmatter slide (no title). Move to first content slide.
  await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(1);
  await page.click('#btnNext');
  await page.waitForTimeout(80);
  // Check overlay present and positioned correctly on first content slide
  await expect(page.locator('.slide.active .slide-overlay')).toHaveClass(/pos-br/);
  const info = await overlayInfo(page);
  expect(info.hasOverlay).toBeGreaterThan(0);
  // Subtitle color present (style computed)
  expect(info.styles.subtitleColor).not.toBe('');

    // Go to the slide with title 'Slide Two'
    for (let i = 0; i < 6; i++) {
      const t = (await page.locator('.slide.active .slide-overlay .slide-title').first().textContent().catch(() => ''))?.trim();
      if (t === 'Slide Two') break;
      await page.click('#btnNext');
      await page.waitForTimeout(120);
    }
    const vars = await page.evaluate(() => {
      const el = document.querySelector('.slide.active .slide-overlay') as HTMLElement | null;
      return {
        titleVar: el?.style.getPropertyValue('--title-size')?.trim() || '',
        subtitleVar: el?.style.getPropertyValue('--subtitle-size')?.trim() || '',
      };
    });
    // Expect per-slide overrides to be applied (from markdown-overlay.md: 28px / 14px)
    expect(vars.titleVar).toBe('28px');
    expect(vars.subtitleVar).toBe('14px');
  });

  test('per-slide overlay on/off overrides deck', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
  await chooser.setInputFiles(path.resolve(__dirname, 'markdown-overlay-per-slide.md'));
    await page.waitForSelector('.slide.active');

    // Slide A: per-slide overlay:on even though deck is off
    await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(1);
    await expect(page.locator('.slide.active .slide-overlay')).toHaveClass(/pos-tl/);

    // Slide B: overlay off
    await page.click('#btnNext');
    await page.waitForTimeout(80);
    await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(0);

  // Slide C: deck overlay ON default => overlay present
    await page.click('#btnNext');
    await page.waitForTimeout(80);
  await expect(page.locator('.slide.active .slide-overlay')).toHaveCount(1);
  });
});
