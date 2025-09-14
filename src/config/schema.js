// Centralized config schema (browser + Node)
// Mirrors src/config/schema.ts for runtime consumption without a build step
(function (global){
  'use strict';

  // Keys accepted by ThemeConfig
  const KEY_SET = new Set([
    'appName','brand',
    'primary','accent','textColor','btnTextColor','btnFill','btnBorderWidth',
    'appBg1','appBg2','slideBg1','slideBg2','slideOpacity',
    'slideBorderOn','slideBorderWidth',
    'overlayOn','overlayPos','overlayTitleSize','overlaySubtitleOn','overlaySubtitleSize','overlaySubtitleColor',
    'fontPrimary','fontSecondary',
    'rememberLastDeck','hideSlidesWithUi','hideProgressWithUi','contentPos'
  ]);

  function normalizeHexLocal(input){
    try{
      const Core = (global && global.ThemeCore) || (typeof window!=='undefined' && window.ThemeCore);
      if(Core && typeof Core.normalizeHex==='function') return Core.normalizeHex(input);
    }catch(e){ /* noop */ void 0; }
    try{
      if(!input) return '';
      let s = String(input).trim().replace(/^['"]|['"]$/g,'');
      if(!s) return '';
      if(!s.startsWith('#')) s = '#' + s;
      const m = s.slice(1);
      if(/^[0-9a-f]{3}$/i.test(m)) return '#' + m.split('').map(c=>c+c).join('').toLowerCase();
      if(/^[0-9a-f]{6}$/i.test(m)) return '#' + m.toLowerCase();
  }catch(e){ /* noop */ void 0; }
    return '';
  }

  function sanitizeConfig(input){
    const out = {};
    if(!input || typeof input !== 'object') return out;
    const obj = input;
    const assignStr=(k)=>{ const v=obj[k]; if(typeof v==='string' && v.trim()) out[k]=v.trim(); };
    const assignHex=(k)=>{ const v=obj[k]; if(typeof v==='string'){ const n=normalizeHexLocal(v); if(n) out[k]=n; } };
    const assignBool=(k, defaultVal)=>{ const v=obj[k]; if(typeof v==='boolean') out[k]=v; else if(typeof v==='undefined') out[k]=defaultVal; };
    const assignNum=(k,min,max)=>{ const v=Number(obj[k]); if(Number.isFinite(v)){ let n=v; if(typeof min==='number') n=Math.max(min,n); if(typeof max==='number') n=Math.min(max,n); out[k]=n; } };

    ['appName','brand','overlayPos','fontPrimary','fontSecondary','contentPos'].forEach(assignStr);
    ['primary','accent','textColor','appBg1','appBg2','slideBg1','slideBg2'].forEach(assignHex);
    // btnTextColor: allow 'auto' or hex
    if(typeof obj.btnTextColor==='string'){
      const raw = obj.btnTextColor.trim();
      if(/^auto$/i.test(raw)) out.btnTextColor = 'auto'; else { const n=normalizeHexLocal(raw); if(n) out.btnTextColor = n; }
    }
    // enums
    if(typeof obj.btnFill==='string' && /^(solid|outline)$/i.test(obj.btnFill)) out.btnFill = obj.btnFill.toLowerCase();
    if(typeof obj.btnBorderWidth!=='undefined'){ const n = Math.round(Number(obj.btnBorderWidth)); if(Number.isFinite(n)) out.btnBorderWidth = Math.max(1, Math.min(6, n)); }
    if(typeof obj.overlaySubtitleColor==='string' && /^(primary|accent)$/i.test(obj.overlaySubtitleColor)) out.overlaySubtitleColor = obj.overlaySubtitleColor.toLowerCase();
    if(typeof obj.contentPos==='string' && /^(t[mlr]|m[mlr]|b[mlr])$/i.test(obj.contentPos)) out.contentPos = obj.contentPos.toLowerCase();
    // numbers
    assignNum('slideOpacity', 0, 1);
    assignNum('slideBorderWidth', 0, 8);
    assignNum('overlayTitleSize', 12, 64);
    assignNum('overlaySubtitleSize', 10, 48);
    // booleans with defaults
    assignBool('slideBorderOn', true);
    assignBool('overlayOn', false);
    assignBool('overlaySubtitleOn', true);
    assignBool('rememberLastDeck', false);
    assignBool('hideSlidesWithUi', true);
    assignBool('hideProgressWithUi', true);
    return out;
  }

  function mergeConfig(base, incoming, mode){
    const safe = sanitizeConfig(incoming);
    const next = (mode==='replace') ? {} : Object.assign({}, base||{});
    return Object.assign(next, safe);
  }

  const api = { KEY_SET, sanitizeConfig, mergeConfig };
  if(typeof module!=='undefined' && module.exports){ module.exports = api; }
  try{ global.ConfigSchema = api; }catch(e){ /* noop */ void 0; }
})(typeof globalThis!=='undefined' ? globalThis : this);
