import { test, expect } from '@playwright/test';
import path from 'path';

test('selected preset matches overlay-position selected style', async ({ page }) => {
  const htmlPath = path.resolve(__dirname, '..', 'slide_app_v_0_91.html');
  const url = `file://${htmlPath}`;
  await page.goto(url);

  // Open Style modal
  const styleOpen = page.locator('#styleBtn');
  await expect(styleOpen).toBeVisible();
  await styleOpen.click();

  // Click first preset button
  const preset = page.locator('button.preset-btn').first();
  await expect(preset).toBeVisible();
  await preset.click();

  // Ensure overlay is enabled so overlay position buttons are active
  const overlayToggle = page.locator('#cfgOverlayTitleOn');
  await expect(overlayToggle).toBeVisible();
  const checked = await overlayToggle.isChecked().catch(()=>false);
  if(!checked){ await overlayToggle.click(); }
  // Now click the first overlay position button
  const overlayBtn = page.locator('#cfgOverlayPos button').first();
  await expect(overlayBtn).toBeVisible();
  await overlayBtn.click();

  // Give the UI a moment to update
  await page.waitForTimeout(120);

  // Get computed styles for the active preset and the active overlay button
  const presetStyle = await page.evaluate(() => {
    const p = document.querySelector('button.preset-btn.active');
    if(!p) return null;
    const cs = getComputedStyle(p);
    return { bg: cs.backgroundImage || cs.background, color: cs.color, boxShadow: cs.boxShadow };
  });

  const overlayStyle = await page.evaluate(() => {
    const o = document.querySelector('#cfgOverlayPos button.active, #cfgOverlayPos button[aria-pressed="true"]');
    if(!o) return null;
    const cs = getComputedStyle(o);
    return { bg: cs.backgroundImage || cs.background, color: cs.color, boxShadow: cs.boxShadow };
  });

  expect(presetStyle).not.toBeNull();
  expect(overlayStyle).not.toBeNull();

  // The selected states should share a visible box-shadow or background indicating selected state
  expect((presetStyle && (presetStyle.boxShadow || presetStyle.bg))? true : false).toBeTruthy();
  expect((overlayStyle && (overlayStyle.boxShadow || overlayStyle.bg))? true : false).toBeTruthy();

  // Colors should be non-empty strings
  expect(typeof presetStyle.color).toBe('string');
  expect(presetStyle.color.length).toBeGreaterThan(0);
  expect(typeof overlayStyle.color).toBe('string');
  expect(overlayStyle.color.length).toBeGreaterThan(0);

  // Strict equality: ensure the computed background, color and boxShadow match exactly between the two elements
  // Normalize rgb/rgba/hex strings before comparing to avoid formatting differences across engines
  const normalizeColor = (s)=>{
    if(!s) return '';
    // collapse whitespace
    let out = s.trim().replace(/\s+/g,' ');
    // normalize rgb/rgba decimals to integers for r,g,b and 2-decimal alpha
    out = out.replace(/rgba?\(([^)]+)\)/g, (m, inner)=>{
      const parts = inner.split(',').map(p=>p.trim());
      const r = Math.round(Number(parts[0])||0);
      const g = Math.round(Number(parts[1])||0);
      const b = Math.round(Number(parts[2])||0);
      if(parts.length>3){ const a = Number(parts[3])||0; return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`; }
      return `rgb(${r}, ${g}, ${b})`;
    });
    // lowercase hex
    out = out.replace(/#([0-9a-fA-F]{3,6})/g, (m,h)=>('#'+h.toLowerCase()));
    return out;
  };

  expect(normalizeColor(presetStyle.bg)).toBe(normalizeColor(overlayStyle.bg));
  expect(normalizeColor(presetStyle.color)).toBe(normalizeColor(overlayStyle.color));
  const pShadow = (presetStyle.boxShadow || '').trim();
  const oShadow = (overlayStyle.boxShadow || '').trim();
  // Normalize any rgba() inside box-shadow strings before compare
  const normalizeShadow = (s)=> s.replace(/rgba?\(([^)]+)\)/g, (m, inner)=>{ const parts = inner.split(',').map(p=>p.trim()); const r=Math.round(Number(parts[0])||0); const g=Math.round(Number(parts[1])||0); const b=Math.round(Number(parts[2])||0); if(parts.length>3){ const a=Number(parts[3])||0; return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`; } return `rgb(${r}, ${g}, ${b})`; });
  expect((normalizeShadow(pShadow) === normalizeShadow(oShadow)) || (pShadow === '' && oShadow === 'none') || (oShadow === '' && pShadow === 'none')).toBeTruthy();
});
