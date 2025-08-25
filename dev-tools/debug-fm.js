const { /*chromium,*/ webkit, /*firefox*/ } = require('playwright');
const path = require('path');
(async ()=>{
  const browser = await webkit.launch();
  const page = await browser.newPage();
  const file = 'file://' + path.resolve(process.cwd(), 'slide_app_v_0_91.html');
  await page.goto(file);
  await page.waitForSelector('#styleBtn');
  const md = `---\nprimary: "#ff0000"\naccent: "#00ff00"\ntextcolor: "#000000"\nopacity: 50\n---\n\n# FM Test\n\nContent here`;
  const result = await page.evaluate((rawMd)=>{
    const slides = splitSlides(rawMd);
    renderSlides(slides);
    applyDeckFrontmatter(slides[0].fm || {});
    return { cfgPrimary: CONFIG.primary, cfgAccent: CONFIG.accent, cfgText: CONFIG.textColor, cfgSlideOpacity: CONFIG.slideOpacity };
  }, md);
  console.log('CONFIG after applyDeckFrontmatter:', result);
  await browser.close();
  process.exit(0);
})();
