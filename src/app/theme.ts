/**
 * Theme helpers (extracted, not wired yet).
 * NOTE: These functions are copies from inline logic in slide_app_v_0_91.html.
 * They are exported for future refactors but currently unused to avoid behavior changes.
 */

export type RGB = { r: number; g: number; b: number };

/** Normalize a hex string to #rrggbb, or return empty string if invalid. */
export function normalizeHex(input: string): string {
  try {
    if (!input) return '';
    let s = String(input).trim().replace(/['"]/g, '');
    if (!s) return '';
    if (!s.startsWith('#')) s = '#' + s;
    const m = s.slice(1);
    if (/^[0-9a-f]{3}$/i.test(m)) return '#' + m.split('').map(c => c + c).join('').toLowerCase();
    if (/^[0-9a-f]{6}$/i.test(m)) return '#' + m.toLowerCase();
  } catch {}
  return '';
}

/** Convert #rrggbb to RGB components, or null if invalid. */
export function hexToRgb(hex: string): RGB | null {
  try {
    const h = normalizeHex(hex);
    if (!h) return null;
    const v = h.slice(1);
    return {
      r: parseInt(v.slice(0, 2), 16),
      g: parseInt(v.slice(2, 4), 16),
      b: parseInt(v.slice(4, 6), 16),
    };
  } catch {
    return null;
  }
}

/**
 * Return '#000000' or '#ffffff' for best contrast against the provided hex color.
 */
export function bestContrastForHex(hex: string): '#000000' | '#ffffff' {
  try {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    // Relative luminance (sRGB)
    const toLin = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const L = 0.2126 * toLin(rgb.r) + 0.7152 * toLin(rgb.g) + 0.0722 * toLin(rgb.b);
    return L < 0.5 ? '#ffffff' : '#000000';
  } catch {
    return '#000000';
  }
}

/** Compute slide background rgba strings, blur, and shadow based on percent 0..100. */
export function computeSlideOpacityVars(pct: number, options?: { base1?: number; base2?: number }) {
  const v = Math.round(Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 100)));
  const dec = v / 100;
  const base1 = options?.base1 ?? 0.75;
  const base2 = options?.base2 ?? 0.55;
  const o1 = Number((base1 * dec).toFixed(3));
  const o2 = Number((base2 * dec).toFixed(3));
  const blurPx = `${(8 * dec).toFixed(2)}px`;
  const shadowAlpha = Number((0.25 * dec).toFixed(3));
  const shadow = `0 10px 30px rgba(0,0,0,${shadowAlpha})`;
  return { dec, o1, o2, blurPx, shadow };
}

/** Compute a readable button text color given primary/accent and optional explicit textColor. */
export function computeBtnTextColor(primary: string, accent: string, explicitTextColor?: string): string {
  const explicit = explicitTextColor && normalizeHex(explicitTextColor);
  if (explicit) return explicit;
  try {
    const p = hexToRgb(primary) || { r: 0, g: 0, b: 0 };
    const a = hexToRgb(accent) || { r: 0, g: 0, b: 0 };
    const avg = { r: Math.round((p.r + a.r) / 2), g: Math.round((p.g + a.g) / 2), b: Math.round((p.b + a.b) / 2) };
    const avgHex = `#${((1 << 24) + (avg.r << 16) + (avg.g << 8) + avg.b).toString(16).slice(1)}`;
    return bestContrastForHex(avgHex);
  } catch {
    return '#000000';
  }
}

/** Compute a muted color suggestion based on current text hex luminance. */
export function computeMutedFromText(textHex: string): string | null {
  const rgb = hexToRgb(textHex);
  if (!rgb) return null;
  const lin = (c: number) => {
    const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
  return L > 0.5 ? 'rgba(11,18,32,0.55)' : 'rgba(255,255,255,0.55)';
}

/**
 * Build the CSS var values for slide background given current opacity percent and
 * optional slideBg1/slideBg2 hex strings (fallback to dark rgba when invalid).
 */
export function buildSlideOpacityCss(pct: number, slideBg1?: string, slideBg2?: string) {
  const { o1, o2, blurPx, shadow, dec } = computeSlideOpacityVars(pct);
  const fallback = { r: 17, g: 24, b: 39 };
  const s1 = normalizeHex(slideBg1 || '') || '';
  const s2 = normalizeHex(slideBg2 || '') || '';
  const c1 = hexToRgb(s1) || fallback;
  const c2 = hexToRgb(s2) || fallback;
  const slideBg1Rgba = `rgba(${c1.r},${c1.g},${c1.b},${o1})`;
  const slideBg2Rgba = `rgba(${c2.r},${c2.g},${c2.b},${o2})`;
  return { dec, slideBg1Rgba, slideBg2Rgba, blurPx, shadow };
}

/**
 * Pure version of setSlideOpacity. Returns computed CSS values without touching the DOM.
 * Alias of buildSlideOpacityCss for clarity of intent.
 */
export function setSlideOpacityPure(pct: number, slideBg1?: string, slideBg2?: string) {
  return buildSlideOpacityCss(pct, slideBg1, slideBg2);
}

// Minimal shape for config we care about in theme computations
export type ThemeConfig = {
  primary?: string;
  accent?: string;
  textColor?: string;
  appBg1?: string;
  appBg2?: string;
  slideBg1?: string;
  slideBg2?: string;
  effectColor?: string;
  slideBorderWidth?: number; // px
  fontPrimary?: string;
  fontSecondary?: string;
  overlayTitleSize?: number; // px
  overlaySubtitleSize?: number; // px
};

export type ThemeComputeResult = {
  cssVars: Record<string, string>;
  derived: {
    btnText: string;
    muted?: string | null;
    activeThumbGradient?: string | null;
  };
};

/**
 * Compute CSS variables and a few derived values from a partial ThemeConfig.
 * This is a pure helper mirroring logic in applyConfig (no DOM reads/writes).
 */
export function computeThemeCssVars(cfg: Partial<ThemeConfig>): ThemeComputeResult {
  const primary = cfg.primary && normalizeHex(cfg.primary) || cfg.primary || '';
  const accent = cfg.accent && normalizeHex(cfg.accent) || cfg.accent || '';

  // Button text prefers explicit textColor, else contrast of average(primary, accent)
  const btnText = computeBtnTextColor(primary || '#000000', accent || '#000000', cfg.textColor);
  const muted = computeMutedFromText(btnText);

  const cssVars: Record<string, string> = {};
  if (primary) cssVars['--primary'] = primary;
  if (accent) cssVars['--accent'] = accent;
  if (primary && accent) cssVars['--btn-bg'] = `linear-gradient(90deg, ${primary}, ${accent})`;
  // Apply global text color
  cssVars['--btn-text'] = btnText;
  cssVars['--text'] = cfg.textColor && normalizeHex(cfg.textColor) || btnText;
  if (cfg.appBg1) cssVars['--app-bg1'] = normalizeHex(cfg.appBg1) || cfg.appBg1;
  if (cfg.appBg2) cssVars['--app-bg2'] = normalizeHex(cfg.appBg2) || cfg.appBg2;
  if (cfg.effectColor) cssVars['--effect-color'] = normalizeHex(cfg.effectColor) || cfg.effectColor;
  if (cfg.slideBg1) cssVars['--slide-bg1'] = normalizeHex(cfg.slideBg1) || cfg.slideBg1;
  if (cfg.slideBg2) cssVars['--slide-bg2'] = normalizeHex(cfg.slideBg2) || cfg.slideBg2;
  if (Number.isFinite(cfg.slideBorderWidth as number)) cssVars['--outline-w'] = `${Math.max(0, Math.min(20, Math.round(cfg.slideBorderWidth as number)))}px`;
  if (cfg.fontPrimary) cssVars['--font-primary'] = cfg.fontPrimary;
  if (cfg.fontSecondary) cssVars['--font-secondary'] = cfg.fontSecondary;
  if (Number.isFinite(cfg.overlayTitleSize as number)) cssVars['--title-size'] = `${Math.max(12, Math.min(64, Math.round(cfg.overlayTitleSize as number)))}px`;
  if (Number.isFinite(cfg.overlaySubtitleSize as number)) cssVars['--subtitle-size'] = `${Math.max(10, Math.min(48, Math.round(cfg.overlaySubtitleSize as number)))}px`;

  const activeThumbGradient = (primary && accent) ? `linear-gradient(135deg, ${primary}, ${accent})` : null;

  return { cssVars, derived: { btnText, muted, activeThumbGradient } };
}
