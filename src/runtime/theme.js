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
    // Merge into existing window.Theme for backward compatibility.
    window.Theme = Object.assign(window.Theme || {}, Theme);
    // If setSlideOpacity is available from the extracted module, prefer it,
    // otherwise provide a simple DOM-wiring shim using computeThemeCssVars.
    if (!window.Theme.setSlideOpacity) {
      window.Theme.setSlideOpacity = function(input, _slideBg1, _slideBg2) {
        try {
          // Accept 0..1 decimals or 0..100 percentages
          var n = Number(input);
          if (!isFinite(n)) n = 100;
          var pct = n > 0 && n <= 1 ? Math.round(n * 100) : Math.round(Math.max(0, Math.min(100, n)));
          var built = (window.Theme && window.Theme.computeThemeCssVars) ? window.Theme.computeThemeCssVars({ slideOpacity: pct/100 }) : {};
          var root = document && document.documentElement;
          if (root && built) {
            if (built['--slide-bg1']) root.style.setProperty('--slide-bg1', built['--slide-bg1']);
            if (built['--slide-bg2']) root.style.setProperty('--slide-bg2', built['--slide-bg2']);
            if (built['--slide-blur']) root.style.setProperty('--slide-blur', built['--slide-blur']);
            if (built['--slide-shadow']) root.style.setProperty('--slide-shadow', built['--slide-shadow']);
            root.style.setProperty('--slide-opacity', String(pct/100));
          }
          return built;
        } catch (e) { return {}; }
      };
    }
  }
})();
