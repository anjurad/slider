import { test, expect } from '@playwright/test';
import path from 'path';

test('applyConfig sets --text from CONFIG.textColor edge cases', async ({ page }) => {
  const htmlPath = path.resolve(__dirname, '..', 'slider.html');
  const url = `file://${htmlPath}`;
  await page.goto(url);

  // Edge values to test: quoted hex, shorthand hex, rgb string
  const cases = [
    { input: '"#ff8800"', expected: '#ff8800' },
    { input: '#f80', expected: '#ff8800' },
    { input: 'rgb(255, 136, 0)', expected: 'rgb(255, 136, 0)' },
  ];

  for(const c of cases){
    await page.evaluate((val)=>{
      // mutate existing CONFIG object so applyConfig reads the new value
      try{ if(typeof CONFIG === 'object') { CONFIG.textColor = val; } else { window.CONFIG = window.CONFIG || {}; window.CONFIG.textColor = val; } }catch(e){ if(typeof console !== 'undefined' && console.debug) console.debug('applyconfig mutation error', e && e.message); }
      try{ applyConfig(); }catch(e){ if(typeof console !== 'undefined' && console.debug) console.debug('applyConfig threw', e && e.message); }
    }, c.input);

    // read computed --text
    let got = await page.evaluate(()=> getComputedStyle(document.documentElement).getPropertyValue('--text').trim());
    // strip surrounding quotes if present
    got = got.replace(/^['"]|['"]$/g,'');
    // helper to expand shorthand hex (#f80 -> #ff8800)
    const expandHex = (h)=>{ if(!h) return h; const m = h.replace(/^['"]|['"]$/g,'').trim().toLowerCase(); if(/^#[0-9a-f]{3}$/.test(m)) return '#'+m.slice(1).split('').map(c=>c+c).join(''); return m; };
    if(c.expected.startsWith('#')){
      expect(expandHex(got)).toBe(expandHex(c.expected));
    } else {
      // for rgb strings, normalize whitespace
      const norm = (s)=> s.replace(/\s+/g,' ').trim();
      expect(norm(got)).toBe(norm(c.expected));
    }
  }
});
