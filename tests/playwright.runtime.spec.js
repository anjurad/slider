const { test, expect } = require('@playwright/test');
const path = require('path');

function fileUrl(p) {
  return 'file://' + path.resolve(p);
}

test.describe('runtime wiring', () => {
  test('window.Particles exists and is callable', async ({ page }) => {
    await page.goto(fileUrl('slide_app_v_0_91.html'));
    // Wait for the page JS to register the runtime
    await page.waitForFunction(() => !!window.Particles, null, { timeout: 2000 });
    const hasParticles = await page.evaluate(() => !!window.Particles);
    expect(hasParticles).toBe(true);

    // Ensure start/stop/resize do not throw when called
    const result = await page.evaluate(() => {
      const p = window.Particles;
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
