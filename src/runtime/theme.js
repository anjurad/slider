/* Lightweight runtime theming helpers (no build step). */
(function initThemeRuntime(){
  function clamp01(n){ return Math.min(1, Math.max(0, n)); }
  function normalizeHex(hex){
    if(!hex) return '#000000';
    const s = String(hex).trim().toLowerCase();
    const m3 = /^#?([0-9a-f]{3})$/i.exec(s);
    if(m3){ const h=m3[1]; return '#'+h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; }
    const m6 = /^#?([0-9a-f]{6})$/i.exec(s);
    if(m6){ return '#'+m6[1]; }
    return '#000000';
  }
  function hexToRgb(hex){
    const h = normalizeHex(hex).slice(1);
    const r = parseInt(h.slice(0,2),16);
    const g = parseInt(h.slice(2,4),16);
    const b = parseInt(h.slice(4,6),16);
    return {r,g,b};
  }
  function toRgbString(hex){
    const {r,g,b} = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
  }
  function computeThemeCssVars(cfg){
    const primary = normalizeHex(cfg.primary||'#1d4ed8');
    const accent  = normalizeHex(cfg.accent ||'#22c55e');
    const text    = normalizeHex(cfg.textColor||'#e5e7eb');
    const btnText = normalizeHex(cfg.btnTextColor||text);
    const slideOpacity = clamp01((cfg.slideOpacity??1));

    return {
      '--primary': primary,
      '--accent': accent,
      '--text': text,
      '--btn-text': btnText,
      '--slide-bg-opacity': String(slideOpacity),
      '--slide-bg-opaque': toRgbString('#0f172a'),
      '--slide-bg-transparent': toRgbString('#0f172a')
    };
  }

  const Theme = { normalizeHex, hexToRgb, computeThemeCssVars };
  if(typeof window !== 'undefined'){
    window.Theme = Object.assign(window.Theme || {}, Theme);
  }
})();
