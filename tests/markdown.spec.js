const { test, expect } = require('@playwright/test');
const path = require('path');
// fs intentionally removed - not used in tests

function toFileUrl(p) {
  const abs = path.resolve(p);
  return 'file://' + abs;
}

test.describe('Slider markdown rendering (WebKit)', () => {

  const appPath = path.resolve(__dirname, '..', 'slider.html');
  const mdPath = path.resolve(__dirname, '..', 'sample_presentation.md');
  const mdFences = path.resolve(__dirname, 'markdown-fences.md');

  test('loads app and renders demo slides', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');
    const counter = page.locator('#slideNo');
    await expect(counter).toContainText('/');
  const firstText = await page.locator('.slide.active').evaluate(el => (el.textContent || '').trim());
  expect(firstText.length).toBeGreaterThan(0);
  });

  test('can load markdown file and navigate slides', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(mdPath);
    await page.waitForSelector('.slide.active');

  // First slide should render content; ensure the loaded deck produced slides
  const thumbCount = await page.locator('.thumb').count();
  expect(thumbCount).toBeGreaterThanOrEqual(4);

    // Try opening each thumbnail until we find the workflow code sample
    let foundCode = false;
    for (let i = 0; i < thumbCount; i++) {
      await page.click(`.thumb:nth-child(${i+1})`);
      await page.waitForTimeout(150);
      const count = await page.locator('.slide.active pre code', { hasText: 'window.postMessage' }).count();
      if (count > 0) { foundCode = true; break; }
    }
    expect(foundCode).toBeTruthy();
    await expect(page.locator('.slide.active pre code', { hasText: 'window.postMessage' })).toHaveCount(1);

    // Find the media slide with a figure/image
    let foundFigure = false;
    for (let i = 0; i < thumbCount; i++) {
      await page.click(`.thumb:nth-child(${i+1})`);
      await page.waitForTimeout(120);
      const figCount = await page.locator('.slide.active figure').count();
      if (figCount > 0) { foundFigure = true; break; }
    }
    expect(foundFigure).toBeTruthy();

    // Find the accessibility slide with a meter element
    let foundMeter = false;
    for (let i = 0; i < thumbCount; i++) {
      await page.click(`.thumb:nth-child(${i+1})`);
      await page.waitForTimeout(120);
      const meterCount = await page.locator('.slide.active meter').count();
      if (meterCount > 0) { foundMeter = true; break; }
    }
    expect(foundMeter).toBeTruthy();

    // Ensure final slide contains CTA buttons
    await page.click('.thumb:last-child');
    await page.waitForTimeout(120);
    await expect(page.locator('.slide.active a.btn', { hasText: 'Read the docs' })).toHaveCount(1);
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
