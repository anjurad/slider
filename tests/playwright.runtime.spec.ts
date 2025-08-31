import { test, expect } from '@playwright/test';

function fileUrl(path: string) {
  const p = require('path');
  return 'file://' + p.resolve(path);
}

test.describe('runtime wiring', () => {
  test('window.Particles exists and is callable', async ({ page }) => {
    await page.goto(fileUrl('slider.html'));
    // Wait for the page JS to register the runtime
    await page.waitForFunction(() => !!(window as any).Particles, null, { timeout: 2000 });
    const hasParticles = await page.evaluate(() => !!(window as any).Particles);
    expect(hasParticles).toBe(true);

    // Ensure start/stop/resize do not throw when called
    const result = await page.evaluate(() => {
      const p = (window as any).Particles;
      let ok = true;
      try {
        if (typeof p.start === 'function') p.start({ prefersReducedMotion: false });
        if (typeof p.resize === 'function') p.resize();
        if (typeof p.stop === 'function') p.stop();
      } catch (e) {
        ok = false;
      }
      return ok;
    });
    expect(result).toBe(true);
  });
});
