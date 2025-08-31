const { test } = require('@playwright/test');
const path = require('path');

function toFileUrl(p){ const abs = path.resolve(p); return 'file://' + abs; }

test('debug dump slides', async ({ page })=>{
  const app = toFileUrl(path.resolve(__dirname, '..', 'slider.html'));
  const md = path.resolve(__dirname, '..', 'sample_presentation.md');
  await page.goto(app);
  await page.waitForSelector('.slide.active .md');
  await page.locator('#fileInput').setInputFiles(md);
  await page.waitForTimeout(500);
  // iterate slides and print snippets to diagnose where code blocks ended up
  const slides = await page.$$eval('.slide', els => els.map((s,i)=>({ idx:i, html: s.querySelector('.md')?.innerHTML || '', text: s.textContent || '' })));
  console.log('Total slides:', slides.length);
  for(const s of slides){
    console.log(`--- Slide ${s.idx} ---`);
    console.log(s.html.slice(0,800));
    try{
      const hasPreCode = await page.$eval(`.slide:nth-child(${s.idx+1}) .md`, el => !!el.querySelector('pre code'));
      console.log('hasPreCode:', hasPreCode);
    }catch(e){ console.log('hasPreCode: error', e.message); }
  }
});
