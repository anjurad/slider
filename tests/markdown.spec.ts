import { test, expect } from '@playwright/test';
import path from 'path';

// Helper to build file:// URL
function toFileUrl(p: string) {
  const abs = path.resolve(p);
  const url = 'file://' + abs;
  return url;
}

test.describe('Slider markdown rendering (WebKit)', () => {

  const appPath = path.resolve(__dirname, '..', 'slider.html');
  const mdPath = path.resolve(__dirname, '..', 'sample_presentation.md');
  const mdFences = path.resolve(__dirname, 'markdown-fences.md');

  test('loads app and renders demo slides', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active');
    // Should show slide counter like 1/N
    const counter = page.locator('#slideNo');
    await expect(counter).toContainText('/');

  const introText = await page.locator('.slide.active').evaluate(el => (el.textContent || '').trim());
  expect(introText.length).toBeGreaterThan(0);
  });

  test('can load markdown file and navigate slides', async ({ page }) => {
    await page.goto(toFileUrl(appPath));

    // Upload markdown via file input
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(mdPath);

    // Wait for first rendered slide
    await page.waitForSelector('.slide.active');

  // Verify slides exist
  const thumbCount = await page.locator('.thumb').count();
  expect(thumbCount).toBeGreaterThanOrEqual(4);

    // Locate slide containing workflow code block
    const codeIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      return slides.findIndex(slide => {
        const block = slide.querySelector('pre code');
        return block && (block.textContent || '').includes('window.postMessage');
      });
    });
    expect(codeIndex).toBeGreaterThan(-1);
    await page.locator('.thumb').nth(codeIndex).click();
    await page.waitForTimeout(150);
    await expect(page.locator('.slide.active pre code', { hasText: 'window.postMessage' })).toHaveCount(1);

    // Find slide with media figure
    const mediaIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      return slides.findIndex(slide => !!slide.querySelector('figure img'));
    });
    expect(mediaIndex).toBeGreaterThan(-1);
    await page.locator('.thumb').nth(mediaIndex).click();
    await page.waitForTimeout(120);
    await expect(page.locator('.slide.active figure img')).toHaveCount(1);

    // Find accessibility slide with meter element
    const meterIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      return slides.findIndex(slide => !!slide.querySelector('meter'));
    });
    expect(meterIndex).toBeGreaterThan(-1);
    await page.locator('.thumb').nth(meterIndex).click();
    await page.waitForTimeout(120);
    await expect(page.locator('.slide.active meter')).toHaveCount(1);

    // Final slide should contain CTA buttons
    await page.locator('.thumb').last().click();
    await page.waitForTimeout(120);
    await expect(page.locator('.slide.active a.btn', { hasText: 'Read the docs' })).toHaveCount(1);
  });

  test('does not split on --- inside code fences', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(mdFences);
    await page.waitForSelector('.slide.active .md');
    const total = await page.locator('.thumb').count();
    expect(total).toBe(2);
    await expect(page.locator('.slide.active .md pre code')).toContainText('--- should not split');
    await page.click('#btnNext');
    await page.waitForTimeout(100);
    await expect(page.locator('.slide.active .md h2')).toHaveText(/Slide B Content/i);
  });

  test('supports YAML frontmatter ending with ellipsis ...', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(path.resolve(__dirname, 'markdown-frontmatter-ellipsis.md'));
    await page.waitForSelector('.slide.active .md');

    const total = await page.locator('.thumb').count();
    expect(total).toBe(2);

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
