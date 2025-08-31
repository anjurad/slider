// Quick debug: load slider.html, upload a deck, and print slide diagnostics
const { webkit } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await webkit.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const app = 'file://' + path.resolve('slider.html');
  const deck = path.resolve('sample_presentation.md');
  await page.goto(app);
  await page.waitForSelector('#fileInput');
  await page.setInputFiles('#fileInput', deck);
  await page.waitForSelector('.slide.active .md');
  const info = await page.evaluate(() => {
    const out = [];
    const slides = Array.from(document.querySelectorAll('.slide'));
    slides.forEach((s, i) => {
      out.push({
        idx: i,
        h2: (s.querySelector('h2')?.textContent || '').trim(),
        imgs: s.querySelectorAll('img').length,
        bq: s.querySelectorAll('blockquote').length,
        tbl: s.querySelectorAll('table').length,
        cols: s.querySelectorAll('.cols .col').length,
      });
    });
    return out;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

