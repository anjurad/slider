import { test, expect } from '@playwright/test';
import path from 'path';

// Helper to build file:// URL
function toFileUrl(p: string) {
  const abs = path.resolve(p);
  const url = 'file://' + abs;
  return url;
}

test.describe('SlideApp markdown rendering (WebKit)', () => {

  const appPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');
  const mdPath = path.resolve(__dirname, '..', 'sample_presentation.md');
  const mdFences = path.resolve(__dirname, 'markdown-fences.md');

  test('loads app and renders demo slides', async ({ page }) => {
    await page.goto(toFileUrl(appPath));
    await page.waitForSelector('.slide.active .md');
    // Should show slide counter like 1/N
    const counter = page.locator('#slideNo');
    await expect(counter).toContainText('/');

  // Basic check: first rendered slide should be visible and contain some content
  await expect(page.locator('.slide.active .md')).toBeVisible();
  const firstTxt = await page.locator('.slide.active .md').evaluate(el => (el.textContent||'').trim());
  expect(firstTxt.length).toBeGreaterThan(0);
  });

  test('can load markdown file and navigate slides', async ({ page }) => {
    await page.goto(toFileUrl(appPath));

    // Upload markdown via file input
    const chooser = page.locator('#fileInput');
    await chooser.setInputFiles(mdPath);

    // Wait for first rendered slide
    await page.waitForSelector('.slide.active .md');

  // Verify first slide content (title and bullets): non-empty content check
  await expect(page.locator('.slide.active .md')).toBeVisible();
  const firstTxt2 = await page.locator('.slide.active .md').evaluate(el => (el.textContent||'').trim());
  expect(firstTxt2.length).toBeGreaterThan(0);

    // Locate which slide contains the code block and navigate to it
    const targetIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      for (let i = 0; i < slides.length; i++) {
        const pc = slides[i].querySelector('pre code');
        if (pc && (pc.textContent || '').includes('function greet')) return i;
      }
      return -1;
    });
    expect(targetIndex).toBeGreaterThan(-1);
  // Navigate to the target slide by clicking its thumbnail for robustness
  await page.locator('.thumb').nth(targetIndex).click();
  await page.waitForTimeout(120);
    // Check code block rendering escaped with <pre><code>
    await expect(page.locator('.slide.active .md pre code', { hasText: 'function greet' })).toHaveCount(1);

    // Find slide that contains an image and navigate to it via thumbnail
    const imgIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      for (let i = 0; i < slides.length; i++) if (slides[i].querySelector('img')) return i;
      return -1;
    });
    expect(imgIndex).toBeGreaterThan(-1);
    await page.locator('.thumb').nth(imgIndex).click();
    await page.waitForTimeout(120);
    await expect(page.locator('.slide.active .md img')).toHaveCount(1);

    // Find slide with 2+ blockquotes and 3+ list items
    const quotesIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      for (let i = 0; i < slides.length; i++) {
        const bq = slides[i].querySelectorAll('blockquote').length;
        const lis = slides[i].querySelectorAll('ul li').length;
        if (bq >= 2 && lis >= 3) return i;
      }
      return -1;
    });
    expect(quotesIndex).toBeGreaterThan(-1);
    await page.locator('.thumb').nth(quotesIndex).click();
    await page.waitForTimeout(120);
    await expect(page.locator('.slide.active .md blockquote')).toHaveCount(2);
    await expect(page.locator('.slide.active .md ul li')).toHaveCount(3);

    // Find slide with a table
    const tableIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      for (let i = 0; i < slides.length; i++) if (slides[i].querySelector('table')) return i;
      return -1;
    });
    expect(tableIndex).toBeGreaterThan(-1);
    await page.locator('.thumb').nth(tableIndex).click();
    await page.waitForTimeout(120);
  const tableCount = await page.locator('.slide.active .md table').count();
  expect(tableCount).toBeGreaterThan(0);

    // Find slide with columns shortcode (.cols .col) and assert 3 columns
    const colsIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      for (let i = 0; i < slides.length; i++) if (slides[i].querySelectorAll('.cols .col').length >= 2) return i;
      return -1;
    });
    expect(colsIndex).toBeGreaterThan(-1);
    await page.locator('.thumb').nth(colsIndex).click();
    await page.waitForTimeout(120);
    await expect(page.locator('.slide.active .md .cols .col')).toHaveCount(3);
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
