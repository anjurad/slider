// Shared, framework-free theme helpers usable in browser and Node.
// Exposes UMD-like exports: window.ThemeCore in browser; module.exports in Node.
(function (global){
  'use strict';

  function clamp01(n){ return Math.min(1, Math.max(0, n)); }

  function normalizeHex(input){
    try{
      if(!input) return '';
      let s = String(input).trim().replace(/^["']|["']$/g,'');
      if(!s) return '';
      if(!s.startsWith('#')) s = '#' + s;
      const m = s.slice(1);
      if(/^[0-9a-f]{3}$/i.test(m)) return '#' + m.split('').map(c=>c+c).join('').toLowerCase();
      if(/^[0-9a-f]{6}$/i.test(m)) return '#' + m.toLowerCase();
      return '';
    }catch{ return ''; }
  }

  function hexToRgb(hex){
    const h = normalizeHex(hex);
    if(!h) return null;
    const v = h.slice(1);
    return { r: parseInt(v.slice(0,2),16), g: parseInt(v.slice(2,4),16), b: parseInt(v.slice(4,6),16) };
  }

  function computeBtnTextColor(primary, accent, explicitTextColor){
    const explicit = normalizeHex(explicitTextColor||'');
    if(explicit) return explicit;
    try{
      const p = hexToRgb(primary) || { r:0,g:0,b:0 };
      const a = hexToRgb(accent) || { r:0,g:0,b:0 };
      const avg = { r: Math.round((p.r+a.r)/2), g: Math.round((p.g+a.g)/2), b: Math.round((p.b+a.b)/2) };
      // Relative luminance to choose contrast
      const toLin=(c)=>{ const s=c/255; return s<=0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4); };
      const L = 0.2126*toLin(avg.r) + 0.7152*toLin(avg.g) + 0.0722*toLin(avg.b);
      return L < 0.5 ? '#ffffff' : '#000000';
    }catch{ return '#000000'; }
  }

  function buildSlideOpacityCss(pct, slideBg1, slideBg2){
    const v = Math.round(Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 100)));
    const dec = v/100;
    const fallback = { r:17, g:24, b:39 };
    const s1 = normalizeHex(slideBg1||'') || null;
    const s2 = normalizeHex(slideBg2||'') || null;
    const c1 = (s1 && hexToRgb(s1)) || fallback;
    const c2 = (s2 && hexToRgb(s2)) || fallback;
    const o1 = (0.75*dec).toFixed(3);
    const o2 = (0.55*dec).toFixed(3);
    const slideBg1Rgba = `rgba(${c1.r},${c1.g},${c1.b},${o1})`;
    const slideBg2Rgba = `rgba(${c2.r},${c2.g},${c2.b},${o2})`;
    const blurPx = `${(8*dec).toFixed(2)}px`;
    const shadow = `0 10px 30px rgba(0,0,0,${(0.25*dec).toFixed(3)})`;
    return { dec, slideBg1Rgba, slideBg2Rgba, blurPx, shadow };
  }

  const api = { normalizeHex, hexToRgb, computeBtnTextColor, buildSlideOpacityCss, clamp01 };
  if(typeof module !== 'undefined' && module.exports){ module.exports = api; }
  try{ (global||window).ThemeCore = api; }catch(e){ /* noop: ThemeCore attach best-effort */ void 0; }
})(typeof globalThis !== 'undefined' ? globalThis : this);

