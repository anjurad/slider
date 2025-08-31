import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) { return 'file://' + path.resolve(p); }

test('Slide frame stays clear of header/footer UI', async ({ page }) => {
  const appPath = path.resolve(__dirname, '..', 'slider.html');
  await page.goto(toFileUrl(appPath));
  await page.waitForSelector('.slide.active');

  const rects = await page.evaluate(() => {
    const header = document.querySelector('.deck-header') as HTMLElement | null;
    const footer = document.querySelector('.deck-footer') as HTMLElement | null;
    const slide = document.querySelector('.slide.active') as HTMLElement | null;
    if (!header || !footer || !slide) return null;
    return {
      header: header.getBoundingClientRect(),
      footer: footer.getBoundingClientRect(),
      slide: slide.getBoundingClientRect(),
    };
  });
  expect(rects).not.toBeNull();
  const { header, footer, slide } = rects! as any;
  // Allow a small tolerance
  expect(slide.top).toBeGreaterThan(header.bottom + 4);
  expect(slide.bottom).toBeLessThan(footer.top - 4);
});

