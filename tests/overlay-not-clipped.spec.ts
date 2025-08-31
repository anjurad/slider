import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string) { return 'file://' + path.resolve(p); }

test('Overlay is visible and not clipped with long content', async ({ page }) => {
  const appPath = path.resolve(__dirname, '..', 'slider.html');
  await page.goto(toFileUrl(appPath));
  await page.waitForSelector('.slide.active');

  // Ensure an overlay is present and positioned (defaults: overlay off; toggle on)
  // Turn overlay on via the button
  await page.click('#overlayBtn');
  await page.waitForSelector('.slide.active .slide-overlay');

  // Scroll the inner content to the bottom
  await page.evaluate(() => {
    const sc = document.querySelector('.slide.active .content-scroll') as HTMLElement | null;
    if (sc) sc.scrollTop = sc.scrollHeight;
  });

  // Measure overlay and slide bounding rects
  const rects = await page.evaluate(() => {
    const slide = document.querySelector('.slide.active') as HTMLElement | null;
    const overlay = document.querySelector('.slide.active .slide-overlay') as HTMLElement | null;
    const content = document.querySelector('.slide.active .content-scroll') as HTMLElement | null;
    if (!slide || !overlay || !content) return null;
    const s = slide.getBoundingClientRect();
    const o = overlay.getBoundingClientRect();
    const c = content.getBoundingClientRect();
    return { s, o, c };
  });
  expect(rects).not.toBeNull();
  const { s, o } = rects! as any;

  // Assert overlay stays inside the slide frame and is visible
  expect(o.top).toBeGreaterThanOrEqual(s.top - 1);
  expect(o.left).toBeGreaterThanOrEqual(s.left - 1);
  expect(o.bottom).toBeLessThanOrEqual(s.bottom + 1);
  expect(o.right).toBeLessThanOrEqual(s.right + 1);
});

