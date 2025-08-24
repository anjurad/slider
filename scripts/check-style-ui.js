const { webkit } = require('playwright');
const path = require('path');
(async ()=>{
  const browser = await webkit.launch();
  const page = await browser.newPage();
  const file = 'file://' + path.resolve(process.cwd(), 'slide_app_v_0_91.html');
  await page.goto(file);
  await page.waitForSelector('#styleBtn');
  await page.click('#styleBtn');
  await page.waitForSelector('#cfgModal', { state: 'visible' });
  // Click first preset button if present
  const preset = await page.$('button.preset-btn');
  if(preset) await preset.click();
  // read computed styles
  const btnBg = await page.evaluate(() => getComputedStyle(document.querySelector('.btn')).getPropertyValue('background-image') || getComputedStyle(document.querySelector('.btn')).getPropertyValue('background'));
  const btnColor = await page.evaluate(() => getComputedStyle(document.querySelector('.btn')).getPropertyValue('color'));
  const brandBg = await page.evaluate(() => getComputedStyle(document.querySelector('.brand-badge')).getPropertyValue('background-image') || getComputedStyle(document.querySelector('.brand-badge')).getPropertyValue('background'));
  console.log('btnBg:', btnBg.trim());
  console.log('btnColor:', btnColor.trim());
  console.log('brandBg:', brandBg.trim());
  await browser.close();
})();
