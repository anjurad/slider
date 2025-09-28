import { test } from '@playwright/test';
import path from 'path';

function toFileUrl(p){ return 'file://' + path.resolve(p); }
const appPath = path.resolve(__dirname, '..', 'slider.html');
const sampleMdPath = path.resolve(__dirname, '..', 'sample_presentation.md');

test('debug inspect slides', async ({ page }) => {
  await page.goto(toFileUrl(appPath));
  await page.waitForSelector('.slide.active .md');
  // load sample via file input
  const input = await page.$('#fileInput');
  await input.setInputFiles(sampleMdPath);
  await page.waitForTimeout(500);
  const slides = await page.$$eval('.slide', nodes => nodes.map((n, idx) => {
    const title = n.querySelector('.md h1, .md h2, .md h3')?.textContent || n.querySelector('.md')?.textContent?.slice(0,80) || '';
    return { idx, title, hasOverride: n.getAttribute('data-slide-bg-override'), dataSlideBg1: n.getAttribute('data-slidebg1'), dataSlideBg2: n.getAttribute('data-slidebg2'), html: n.querySelector('.md')?.innerHTML?.slice(0,200) };
  }));
  console.log(JSON.stringify(slides, null, 2));
  const codeSlides = await page.$$eval('.slide', nodes => nodes.map((n,i)=> ({ idx:i, hasCode: /(window\.postMessage)/i.test(n.innerText) })));
  console.log('codeSlides:', JSON.stringify(codeSlides, null, 2));
  const preCount = await page.$$eval('pre', nodes => nodes.length);
  const codeCount = await page.$$eval('pre code', nodes => nodes.length);
  const bodyHas = await page.evaluate(()=> document.body.innerHTML.includes('<pre><code'));
  console.log('preCount', preCount, 'codeCount', codeCount, 'bodyHasPreCode', bodyHas);
  if(bodyHas){
    const snippet = await page.evaluate(()=>{ const s=document.body.innerHTML; const i=s.indexOf('<pre><code'); return s.slice(Math.max(0,i-120), i+120); });
    console.log('snippet around pre:', snippet);
  }
  const parsed = await page.evaluate(()=> parseMarkdown('```js\nwindow.postMessage({\n  type: \'slider.config\',\n  action: \'merge\',\n  config: {\n    primary: \'#007ACC\',\n    btnFill: \'outline\',\n    slideOpacity: 0.85\n  }\n}, \'*\');\n```'));
  console.log('parsed sample markdown:', parsed.slice(0,200));
  // Fetch raw sample file and run splitSlides to inspect raw bodies
  const rawSlides = await page.evaluate(async ()=>{
    try{
      const res = await fetch('sample_presentation.md');
      const txt = await res.text();
      return splitSlides(txt).slice(0,12);
    }catch(e){ return {err: String(e)}; }
  });
  console.log('rawSlides[0..11]:', JSON.stringify(rawSlides, null, 2));
});
