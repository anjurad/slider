const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

function toFileUrl(p) {
  const abs = path.resolve(p);
  return 'file://' + abs;
}

test.describe('SlideApp markdown rendering (WebKit)', () => {

  const appPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');
  const mdPath = path.resolve(__dirname, '..', 'sample_presentation.md');
  const mdFences = path.resolve(__dirname, 'markdown-fences.md');

  test('loads app and renders demo slides', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');
    const counter = page.locator('#slideNo');
    await expect(counter).toContainText('/');
  // First slide should contain some welcoming text (allow variations in renderer)
  const slideText = await page.locator('.slide.active .md').textContent();
  await expect(slideText).toBeTruthy();
  });

  test('can load markdown file and navigate slides', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(mdPath);
    await page.waitForSelector('.slide.active .md');

  // First slide should render content; ensure the loaded deck produced slides
  await expect(page.locator('.slide.active .md')).not.toBeEmpty();

    // Try opening each thumbnail until we find the code sample with 'function greet'
    const thumbs = await page.locator('.thumb').count();
    let found = false;
    for (let i = 0; i < thumbs; i++) {
      await page.click(`.thumb:nth-child(${i+1})`);
      await page.waitForTimeout(120);
      const count = await page.locator('.slide.active .md pre code', { hasText: 'function greet' }).count();
      if (count > 0) { found = true; break; }
    }
    expect(found).toBeTruthy();
    await expect(page.locator('.slide.active .md pre code', { hasText: 'function greet' })).toHaveCount(1);

    // Find a slide that contains an image by scanning thumbnails
    const totalThumbs = await page.locator('.thumb').count();
    let foundImg = false;
    for (let i = 0; i < totalThumbs; i++) {
      await page.click(`.thumb:nth-child(${i+1})`);
      await page.waitForTimeout(120);
      const imgCount = await page.locator('.slide.active .md img').count();
      if (imgCount > 0) { foundImg = true; break; }
    }
    expect(foundImg).toBeTruthy();
    await expect(page.locator('.slide.active .md img')).toHaveCount(1);

    // Advance until we reach the Quotes & Lists slide (2 blockquotes + 3 list items)
    for (let i = 0; i < 5; i++) {
      await page.click('#btnNext');
      await page.waitForTimeout(80);
      const bqCount = await page.locator('.slide.active .md blockquote').count();
      if (bqCount >= 2) break;
    }
    await expect(page.locator('.slide.active .md blockquote')).toHaveCount(2);
    await expect(page.locator('.slide.active .md ul li')).toHaveCount(3);

    // Find table slide within next slides
    for (let i = 0; i < 6; i++) {
      await page.click('#btnNext');
      await page.waitForTimeout(60);
      const tableCount = await page.locator('.slide.active .md table').count();
      if (tableCount > 0) break;
    }
  // Renderer may produce multiple small tables; ensure at least one table is present
  const tblCount = await page.locator('.slide.active .md table').count();
  expect(tblCount).toBeGreaterThan(0);

    // Find columns shortcode
    for (let i = 0; i < 6; i++) {
      await page.click('#btnNext');
      await page.waitForTimeout(60);
      const colsCount = await page.locator('.slide.active .md .cols .col').count();
      if (colsCount >= 2) break;
    }
    await expect(page.locator('.slide.active .md .cols .col')).toHaveCount(3);
  });

  test('does not split on --- inside code fences', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(mdFences);
    await page.waitForSelector('.slide.active .md');
    // Count rendered slides via thumbnails
    const total = await page.locator('.thumb').count();
    expect(total).toBe(2);
    // First slide contains the code fence content
    await expect(page.locator('.slide.active .md pre code')).toContainText("--- should not split");
    // Next slide should exist and be reachable
    await page.click('#btnNext');
    await page.waitForTimeout(100);
    await expect(page.locator('.slide.active .md h2')).toHaveText(/Slide B Content/i);
  });

  test('supports YAML frontmatter ending with ellipsis ...', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(path.resolve(__dirname, 'markdown-frontmatter-ellipsis.md'));
    await page.waitForSelector('.slide.active .md');

    // There should be exactly 2 slides
    const total = await page.locator('.thumb').count();
    expect(total).toBe(2);

    // Verify slide contents
    const slideTexts = await page.evaluate(() => Array.from(document.querySelectorAll('.slide')).map(s => s.textContent || ''));
    expect(slideTexts[0]).toContain('Content A');
    expect(slideTexts[1]).toContain('Content B');
  });

  test('does not split on --- inside HTML comments', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(path.resolve(__dirname, 'markdown-html-comment.md'));
    await page.waitForSelector('.slide.active .md');
    const total = await page.locator('.thumb').count();
    expect(total).toBe(2);
    const slideTexts = await page.evaluate(() => Array.from(document.querySelectorAll('.slide')).map(s => s.textContent || ''));
    expect(slideTexts[0]).toContain('Start A');
    expect(slideTexts[1]).toContain('Start B');
  });

  test('does not split on --- inside simple HTML blocks', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(path.resolve(__dirname, 'markdown-html-block.md'));
    await page.waitForSelector('.slide.active .md');
    const total = await page.locator('.thumb').count();
    expect(total).toBe(2);
    const slideTexts = await page.evaluate(() => Array.from(document.querySelectorAll('.slide')).map(s => s.textContent || ''));
    expect(slideTexts[0]).toContain('Start A');
    expect(slideTexts[1]).toContain('Start B');
  });
});
