/* Lightweight runtime theming helpers (no build step).
   Uses shared core helpers from window.ThemeCore when available
   to keep logic consistent with src/app/theme.ts.
*/
(function initThemeRuntime(){
  var Core = (typeof window !== 'undefined' && window.ThemeCore) ? window.ThemeCore : null;
  function clamp01(n){ return Math.min(1, Math.max(0, n)); }
  function normalizeHex(hex){
    if(Core && Core.normalizeHex) return Core.normalizeHex(hex);
    if(!hex) return '';
    // strip surrounding quotes if present and normalize
    let s = String(hex).trim().replace(/^['"]|['"]$/g, '').toLowerCase();
    const m3 = /^#?([0-9a-f]{3})$/i.exec(s);
    if(m3){ const h=m3[1]; return '#'+h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; }
    const m6 = /^#?([0-9a-f]{6})$/i.exec(s);
    if(m6){ return '#'+m6[1]; }
    return '';
  }
  function hexToRgb(hex){
    if(Core && Core.hexToRgb) return Core.hexToRgb(hex);
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
  const rawPrimary = (cfg && cfg.primary) ? String(cfg.primary).trim() : '';
  const rawAccent = (cfg && cfg.accent) ? String(cfg.accent).trim() : '';
  const rawText = (cfg && cfg.textColor) ? String(cfg.textColor).trim() : '';
  const rawBtn = (cfg && cfg.btnTextColor) ? String(cfg.btnTextColor).trim() : '';
  const primary = rawPrimary ? (normalizeHex(rawPrimary) || rawPrimary) : '';
  const accent = rawAccent ? (normalizeHex(rawAccent) || rawAccent) : '';
  const text = rawText ? (normalizeHex(rawText) || rawText) : '';
  const btnText = rawBtn ? (normalizeHex(rawBtn) || rawBtn) : (text || '');
    const slideOpacity = clamp01((cfg.slideOpacity??1));

    return {
      '--primary': primary,
      '--accent': accent,
      '--text': text || btnText || '',
      '--btn-text': btnText || (text || ''),
      '--slide-bg-opacity': String(slideOpacity),
      '--slide-bg-opaque': toRgbString('#0f172a'),
      '--slide-bg-transparent': toRgbString('#0f172a')
    };
  }

  const Theme = { normalizeHex, hexToRgb, computeThemeCssVars };
  if(typeof window !== 'undefined'){
    // Merge into existing window.Theme for backward compatibility.
    window.Theme = Object.assign(window.Theme || {}, Theme);
    // Provide a small runtime shim for applyFontOutline that mirrors the
    // extracted TypeScript helper `applyFontOutline`. This allows the
    // HTML runtime to call `window.Theme.applyFontOutline(cfg)` even when
    // the full extracted module isn't wired.
    if (!window.Theme.applyFontOutline) {
      window.Theme.applyFontOutline = function(cfg){
        try {
          const outcome = { cssVars: {}, classes: {} };
          // font variables
          if (cfg && typeof cfg.fontPrimary === 'string' && cfg.fontPrimary.trim()) outcome.cssVars['--font-primary'] = cfg.fontPrimary.trim();
          if (cfg && typeof cfg.fontSecondary === 'string' && cfg.fontSecondary.trim()) outcome.cssVars['--font-secondary'] = cfg.fontSecondary.trim();
          // outline width (slide border)
          if (typeof cfg.slideBorderWidth === 'number' && isFinite(cfg.slideBorderWidth)) outcome.cssVars['--outline-w'] = String(Math.max(0, Math.min(20, Math.round(cfg.slideBorderWidth)))) + 'px';
          // border-off class
          outcome.classes['border-off'] = (cfg && cfg.slideBorderOn === false) ? true : false;

          // Apply to DOM when available
          try {
            const root = document && document.documentElement;
            if (root) {
              for (const k in outcome.cssVars) {
                if (Object.prototype.hasOwnProperty.call(outcome.cssVars, k) && outcome.cssVars[k]) root.style.setProperty(k, outcome.cssVars[k]);
              }
              for (const cls in outcome.classes) {
                if (Object.prototype.hasOwnProperty.call(outcome.classes, cls)) {
                  if (outcome.classes[cls]) root.classList.add(cls); else root.classList.remove(cls);
                }
              }
            }
          } catch (e) { /* ignore DOM errors */ }

          return { cssVars: outcome.cssVars, classes: outcome.classes, derived: {} };
        } catch (e) { return { cssVars: {}, classes: {}, derived: {} }; }
      };
    }
    // Provide computeApplyConfigOutcome and applyConfig shims if not present.
    if (!window.Theme.computeApplyConfigOutcome) {
      window.Theme.computeApplyConfigOutcome = function(cfg){
        try {
          cfg = cfg || {};
          const cssVars = {};
          const derived = {};
          // Primary / accent / text
          const primary = (cfg.primary && String(cfg.primary).trim()) ? normalizeHex(String(cfg.primary)) : '';
          const accent = (cfg.accent && String(cfg.accent).trim()) ? normalizeHex(String(cfg.accent)) : '';
          if (primary) cssVars['--primary'] = primary;
          if (accent) cssVars['--accent'] = accent;
          // Button background fill
          const btnFill = (cfg.btnFill && String(cfg.btnFill).trim().toLowerCase()) || '';
          if (btnFill === 'outline') {
            cssVars['--btn-bg'] = 'transparent';
          } else if (primary && accent) {
            cssVars['--btn-bg'] = `linear-gradient(90deg, ${primary}, ${accent})`;
          }
          // btn-text and text
          // Accept raw color strings (hex quoted, shorthand, or rgb()).
          const rawText = (cfg.textColor && String(cfg.textColor).trim()) ? String(cfg.textColor).trim() : null;
          const normalizedText = rawText ? normalizeHex(rawText) : null;
          // Button text color: allow explicit btnTextColor or 'auto'
          const rawBtnText = (cfg.btnTextColor && String(cfg.btnTextColor).trim()) ? String(cfg.btnTextColor).trim() : null;
          let btnTextFinal = null;
          if (rawBtnText && /^auto$/i.test(rawBtnText)) {
            // AUTO: choose black/white by averaging primary+accent (fallback to app bg)
            const toRgb = (h)=>{ const n=normalizeHex(h||''); if(!n) return null; const v=n.slice(1); return { r:parseInt(v.slice(0,2),16), g:parseInt(v.slice(2,4),16), b:parseInt(v.slice(4,6),16) }; };
            const pr = toRgb(primary) || {r:17,g:24,b:39};
            const ac = toRgb(accent) || {r:17,g:24,b:39};
            const avg = { r: Math.round((pr.r+ac.r)/2), g: Math.round((pr.g+ac.g)/2), b: Math.round((pr.b+ac.b)/2) };
            const toLin=(c)=>{ const s=c/255; return s<=0.03928? s/12.92: Math.pow((s+0.055)/1.055,2.4); };
            const L = 0.2126*toLin(avg.r)+0.7152*toLin(avg.g)+0.0722*toLin(avg.b);
            btnTextFinal = (L < 0.5) ? '#ffffff' : '#000000';
          } else if (rawBtnText) {
            const n = normalizeHex(rawBtnText);
            btnTextFinal = n || rawBtnText; // allow rgb(...)
          }
          // General text color fallback chain
          const finalText = (normalizedText && normalizedText.length) ? normalizedText : (rawText || null);
          cssVars['--btn-text'] = btnTextFinal || finalText || '#000000';
          cssVars['--text'] = finalText || cssVars['--btn-text'];
          // App/background/effect
          if (cfg.appBg1) cssVars['--app-bg1'] = normalizeHex(String(cfg.appBg1)) || String(cfg.appBg1);
          if (cfg.appBg2) cssVars['--app-bg2'] = normalizeHex(String(cfg.appBg2)) || String(cfg.appBg2);
          if (cfg.effectColor) cssVars['--effect-color'] = normalizeHex(String(cfg.effectColor)) || String(cfg.effectColor);
          if (cfg.slideBg1) cssVars['--slide-bg1'] = normalizeHex(String(cfg.slideBg1)) || String(cfg.slideBg1);
          if (cfg.slideBg2) cssVars['--slide-bg2'] = normalizeHex(String(cfg.slideBg2)) || String(cfg.slideBg2);
          if (typeof cfg.slideBorderWidth === 'number' && isFinite(cfg.slideBorderWidth)) cssVars['--outline-w'] = `${Math.max(0, Math.min(20, Math.round(cfg.slideBorderWidth)))}px`;
          if (cfg.fontPrimary) cssVars['--font-primary'] = cfg.fontPrimary;
          if (cfg.fontSecondary) cssVars['--font-secondary'] = cfg.fontSecondary;
          if (typeof cfg.overlayTitleSize === 'number' && isFinite(cfg.overlayTitleSize)) cssVars['--title-size'] = `${Math.max(12, Math.min(64, Math.round(cfg.overlayTitleSize)))}px`;
          if (typeof cfg.overlaySubtitleSize === 'number' && isFinite(cfg.overlaySubtitleSize)) cssVars['--subtitle-size'] = `${Math.max(10, Math.min(48, Math.round(cfg.overlaySubtitleSize)))}px`;

          // compute slide opacity CSS if provided as decimal 0..1
          if (typeof cfg.slideOpacity === 'number' && isFinite(cfg.slideOpacity)) {
            var pct = Math.round(Math.max(0, Math.min(100, cfg.slideOpacity * 100)));
            var built = (Core && Core.buildSlideOpacityCss) ? Core.buildSlideOpacityCss(pct, cfg.slideBg1, cfg.slideBg2) : null;
            if (built){
              cssVars['--slide-bg1'] = built.slideBg1Rgba;
              cssVars['--slide-bg2'] = built.slideBg2Rgba;
              cssVars['--slide-blur'] = built.blurPx;
              cssVars['--slide-shadow'] = built.shadow;
            } else {
              var fallbackRgb = { r: 17, g: 24, b: 39 };
              var s1 = (cfg.slideBg1 && normalizeHex(String(cfg.slideBg1))) || null;
              var s2 = (cfg.slideBg2 && normalizeHex(String(cfg.slideBg2))) || null;
              var c1 = s1 ? hexToRgb(s1) : fallbackRgb;
              var c2 = s2 ? hexToRgb(s2) : fallbackRgb;
              var o1 = (0.75 * (pct/100)).toFixed(3);
              var o2 = (0.55 * (pct/100)).toFixed(3);
              cssVars['--slide-bg1'] = `rgba(${c1.r},${c1.g},${c1.b},${o1})`;
              cssVars['--slide-bg2'] = `rgba(${c2.r},${c2.g},${c2.b},${o2})`;
              cssVars['--slide-blur'] = `${(8 * (pct/100)).toFixed(2)}px`;
              cssVars['--slide-shadow'] = `0 10px 30px rgba(0,0,0,${(0.25 * (pct/100)).toFixed(3)})`;
            }
          }

          const classes = { 'border-off': cfg.slideBorderOn === false };

          // derived: compute btnText roughly (prefer textColor else contrast of primary/accent)
          derived.btnText = finalText || '#000000';
          derived.muted = null;
            const activeThumbGradient = (primary && accent) ? `linear-gradient(135deg, ${primary}, ${accent})` : null;
            if (activeThumbGradient) cssVars['--thumb-active-bg'] = activeThumbGradient;

          return { cssVars, classes, derived };
        } catch (e) { return { cssVars: {}, classes: {}, derived: {} }; }
      };
    }

    if (!window.Theme.applyConfig) {
      window.Theme.applyConfig = function(cfg){
        try {
          const outcome = (window.Theme.computeApplyConfigOutcome) ? window.Theme.computeApplyConfigOutcome(cfg) : { cssVars: {}, classes: {}, derived: {} };
          const root = document && document.documentElement;
          if (root && outcome && outcome.cssVars) {
            for (const k in outcome.cssVars) {
              if (Object.prototype.hasOwnProperty.call(outcome.cssVars, k) && outcome.cssVars[k]) root.style.setProperty(k, outcome.cssVars[k]);
            }
          }
          if (root && outcome && outcome.classes) {
            for (const cls in outcome.classes) {
              if (Object.prototype.hasOwnProperty.call(outcome.classes, cls)) {
                if (outcome.classes[cls]) root.classList.add(cls); else root.classList.remove(cls);
              }
            }
          }
          return outcome;
        } catch (e) { return { cssVars: {}, classes: {}, derived: {} }; }
      };
    }
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
