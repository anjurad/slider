/**
 * Theme helpers (extracted, not wired yet).
 * NOTE: These functions are copies from inline logic in slide_app_v_0_91.html.
 * They are exported for future refactors but currently unused to avoid behavior changes.
 */

/**
 * Get CSS custom property value from document root with fallback.
 * Pure helper - no side effects.
 */
export function getCssPropertyValue(propertyName: string, fallback: string = ''): string {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(propertyName).trim() || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Set CSS custom property on document root.
 * Small helper - encapsulates the pattern used throughout applyConfig.
 */
export function setCssProperty(propertyName: string, value: string): void {
  try {
    document.documentElement.style.setProperty(propertyName, value);
  } catch {
    // Silently fail if document is not available
  }
}

/**
 * Average two RGB color values.
 * Pure helper - takes two RGB objects and returns their average.
 */
export function averageRgb(rgb1: {r: number, g: number, b: number}, rgb2: {r: number, g: number, b: number}): {r: number, g: number, b: number} {
  return {
    r: Math.round((rgb1.r + rgb2.r) / 2),
    g: Math.round((rgb1.g + rgb2.g) / 2),
    b: Math.round((rgb1.b + rgb2.b) / 2)
  };
}

/**
 * Convert RGB color to hex string.
 * Pure helper - converts {r,g,b} to "#rrggbb" format.
 */
export function rgbToHex(rgb: {r: number, g: number, b: number}): string {
  return `#${((1<<24) + (rgb.r<<16) + (rgb.g<<8) + rgb.b).toString(16).slice(1)}`;
}

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
  slideOpacity?: number; // decimal 0..1
  slideBorderOn?: boolean;
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

export type ApplyOutcome = {
  cssVars: Record<string, string>;
  classes: Record<string, boolean>;
  derived: ThemeComputeResult['derived'] & {
    slideOpacity?: number; // decimal 0..1
  };
};

/**
 * Normalize a partial config with sensible defaults and simple migrations.
 * Does not mutate the input object.
 */
export function normalizeConfig(cfg: Partial<ThemeConfig & { brand?: string; appName?: string; overlayOn?: boolean; overlaySubtitleOn?: boolean; overlaySubtitleColor?: 'primary'|'accent'; }>): Partial<ThemeConfig & { appName?: string; overlayOn?: boolean; overlaySubtitleOn?: boolean; overlaySubtitleColor?: 'primary'|'accent'; }>{
  const out: any = { ...cfg };
  // appName from brand fallback (do not delete brand here)
  if (typeof out.appName !== 'string' && typeof (out as any).brand === 'string') {
    out.appName = (out as any).brand;
  }
  if (typeof out.slideBorderOn !== 'boolean') out.slideBorderOn = true;
  if (!Number.isFinite(out.slideBorderWidth)) out.slideBorderWidth = 3;
  if (!Number.isFinite(out.overlayTitleSize)) out.overlayTitleSize = 22;
  if (typeof out.overlaySubtitleOn !== 'boolean') out.overlaySubtitleOn = true;
  if (!Number.isFinite(out.overlaySubtitleSize)) out.overlaySubtitleSize = 16;
  if (typeof out.overlaySubtitleColor !== 'string') out.overlaySubtitleColor = 'primary';
  if (typeof out.fontPrimary !== 'string') out.fontPrimary = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  if (typeof out.fontSecondary !== 'string') out.fontSecondary = 'Arial, Helvetica, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  // slideOpacity stays as-is if provided (decimal 0..1)
  return out;
}

/**
 * Compute the effect of applyConfig as data: cssVars to set, classes to toggle,
 * and derived values. This function is pure and does not touch the DOM.
 */
export function computeApplyConfigOutcome(cfg: Partial<ThemeConfig>): ApplyOutcome {
  const { cssVars, derived } = computeThemeCssVars(cfg);

  // Compute slide opacity CSS vars if provided (decimal 0..1)
  if (typeof cfg.slideOpacity === 'number' && isFinite(cfg.slideOpacity)) {
    const pct = Math.round(Math.max(0, Math.min(100, cfg.slideOpacity * 100)));
    const built = buildSlideOpacityCss(pct, cfg.slideBg1, cfg.slideBg2);
    cssVars['--slide-bg1'] = built.slideBg1Rgba;
    cssVars['--slide-bg2'] = built.slideBg2Rgba;
    cssVars['--slide-blur'] = built.blurPx;
    cssVars['--slide-shadow'] = built.shadow;
  }

  // Outline visibility
  const classes: Record<string, boolean> = {
    'border-off': cfg.slideBorderOn === false,
  };

  return {
    cssVars,
    classes,
    derived: { ...derived, slideOpacity: cfg.slideOpacity },
  };
}

/**
 * Safely sets a CSS custom property if the value is a non-empty string.
 * @param property CSS custom property name (e.g., '--app-bg1')
 * @param value The value to set (checked for string type and non-empty)
 */
export function setColorProperty(property: string, value: any): void {
  if (typeof value === 'string' && value.trim()) {
    document.documentElement.style.setProperty(property, value.trim());
  }
}

/**
 * Sets a CSS custom property to a pixel value with safe numeric clamping.
 * @param property CSS custom property name (e.g., '--title-size')
 * @param value The numeric value to clamp and set
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 */
export function setPixelProperty(property: string, value: any, min: number, max: number): void {
  if (typeof value === 'number' && isFinite(value)) {
    const clamped = Math.max(min, Math.min(max, Math.round(value)));
    document.documentElement.style.setProperty(property, `${clamped}px`);
  }
}

/**
 * Apply a partial theme config to the document.
 * This is a thin DOM-wiring wrapper around computeApplyConfigOutcome.
 * It returns the computed outcome for testing and does not throw when DOM is missing.
 */
export function applyConfig(cfg: Partial<ThemeConfig>): ApplyOutcome {
  const outcome = computeApplyConfigOutcome(cfg);
  try {
    const root = document && document.documentElement;
    if (root) {
      // set css vars
      for (const [k, v] of Object.entries(outcome.cssVars)) {
        if (typeof v === 'string' && v.trim()) root.style.setProperty(k, v);
      }
      // toggle classes on root element
      for (const [cls, on] of Object.entries(outcome.classes)) {
        if (on) root.classList.add(cls); else root.classList.remove(cls);
      }
    }
  } catch {
    // ignore DOM errors in non-browser environments
  }
  return outcome;
}
