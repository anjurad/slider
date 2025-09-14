/**
 * Theme helpers (extracted, not wired yet).
 * Delegates core color utilities to shared ThemeCore to avoid drift.
 */

// Import shared ThemeCore (UMD/CommonJS)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ThemeCore: {
  normalizeHex: (s: string) => string;
  hexToRgb: (s: string) => RGB | null;
  computeBtnTextColor: (p: string, a: string, t?: string) => string;
  buildSlideOpacityCss: (
    pct: number,
    s1?: string,
    s2?: string
  ) => { dec: number; slideBg1Rgba: string; slideBg2Rgba: string; blurPx: string; shadow: string };
} = require('../shared/theme-core.js');

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
  return ThemeCore.normalizeHex(input);
}

/** Convert #rrggbb to RGB components, or null if invalid. */
export function hexToRgb(hex: string): RGB | null {
  return ThemeCore.hexToRgb(hex);
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
    // fallback on error
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
  return ThemeCore.computeBtnTextColor(primary, accent, explicitTextColor);
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
  return ThemeCore.buildSlideOpacityCss(pct, slideBg1, slideBg2);
}

/**
 * Pure version of setSlideOpacity. Returns computed CSS values without touching the DOM.
 * Alias of buildSlideOpacityCss for clarity of intent.
 */
export function setSlideOpacityPure(pct: number, slideBg1?: string, slideBg2?: string) {
  return buildSlideOpacityCss(pct, slideBg1, slideBg2);
}

/**
 * DOM-wiring version of setSlideOpacity. Accepts pct as 0..1 or 0..100 and
 * sets CSS custom properties on document.documentElement. Returns the computed
 * CSS values (same shape as setSlideOpacityPure result).
 */
export function setSlideOpacity(input: number | string, slideBg1?: string, slideBg2?: string) {
  let n = Number(input);
  if (!Number.isFinite(n)) n = 100;
  // Allow decimal 0..1 or percent 0..100
  const pct = n > 0 && n <= 1 ? Math.round(n * 100) : Math.round(Math.max(0, Math.min(100, n)));
  const computed = buildSlideOpacityCss(pct, slideBg1, slideBg2);
  try {
    const root = document && document.documentElement;
    if (root) {
      root.style.setProperty('--slide-bg1', computed.slideBg1Rgba);
      root.style.setProperty('--slide-bg2', computed.slideBg2Rgba);
      root.style.setProperty('--slide-blur', computed.blurPx);
      root.style.setProperty('--slide-shadow', computed.shadow);
      root.style.setProperty('--slide-opacity', String(computed.dec));
    }
  } catch {
    // noop in non-DOM environments
  }
  return computed;
}

/**
 * Apply fonts and outline-related config to the document.
 * Only wires the subset of applyConfig that touches fonts and outline so
 * it can be extracted and tested independently.
 */
export function applyFontOutline(cfg: Partial<ThemeConfig>) {
  const outcome = computeApplyConfigOutcome(cfg);
  try {
    const root = document && document.documentElement;
    if (root) {
      if (outcome.cssVars['--font-primary']) root.style.setProperty('--font-primary', outcome.cssVars['--font-primary']);
      if (outcome.cssVars['--font-secondary']) root.style.setProperty('--font-secondary', outcome.cssVars['--font-secondary']);
      if (outcome.cssVars['--outline-w']) root.style.setProperty('--outline-w', outcome.cssVars['--outline-w']);
      // toggle border-off class as computed
      if (typeof outcome.classes['border-off'] !== 'undefined') {
        if (outcome.classes['border-off']) root.classList.add('border-off'); else root.classList.remove('border-off');
      }
    }
  } catch {
    // ignore DOM errors in non-browser environments
  }
  return outcome;
}

// Minimal shape for config we care about in theme computations
export type ThemeConfig = {
  primary?: string;
  accent?: string;
  textColor?: string;
  btnTextColor?: string | 'auto';
  btnFill?: 'solid' | 'outline';
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

  // Button text precedence:
  // 1) cfg.btnTextColor === 'auto' -> contrast of avg(primary, accent)
  // 2) cfg.btnTextColor (string) -> normalized hex or raw (allow rgb(...))
  // 3) fallback -> compute from primary/accent, allowing cfg.textColor as explicit override
  let btnText: string;
  const btnPref = cfg.btnTextColor;
  if (typeof btnPref === 'string' && btnPref.toLowerCase() === 'auto') {
    // compute automatically ignoring explicit textColor
    btnText = computeBtnTextColor(primary || '#000000', accent || '#000000');
  } else if (typeof btnPref === 'string' && btnPref.trim()) {
    btnText = normalizeHex(btnPref) || btnPref.trim();
  } else {
    btnText = computeBtnTextColor(primary || '#000000', accent || '#000000', cfg.textColor);
  }
  const muted = computeMutedFromText(btnText);

  const cssVars: Record<string, string> = {};
  if (primary) cssVars['--primary'] = primary;
  if (accent) cssVars['--accent'] = accent;
  if (primary && accent) cssVars['--btn-bg'] = `linear-gradient(90deg, ${primary}, ${accent})`;
  // Apply global text color
  cssVars['--btn-text'] = btnText;
  // Preserve non-hex values like rgb(...); normalize when possible
  cssVars['--text'] = cfg.textColor ? (normalizeHex(cfg.textColor) || cfg.textColor) : btnText;
  if (cfg.appBg1) cssVars['--app-bg1'] = normalizeHex(cfg.appBg1) || cfg.appBg1;
  if (cfg.appBg2) cssVars['--app-bg2'] = normalizeHex(cfg.appBg2) || cfg.appBg2;
  if (cfg.effectColor) cssVars['--effect-color'] = normalizeHex(cfg.effectColor) || cfg.effectColor;
  if (cfg.slideBg1) cssVars['--slide-bg1'] = normalizeHex(cfg.slideBg1) || cfg.slideBg1;
  if (cfg.slideBg2) cssVars['--slide-bg2'] = normalizeHex(cfg.slideBg2) || cfg.slideBg2;
  if (typeof cfg.slideBorderWidth === 'number' && Number.isFinite(cfg.slideBorderWidth)) cssVars['--outline-w'] = `${Math.max(0, Math.min(20, Math.round(cfg.slideBorderWidth)))}px`;
  if (cfg.fontPrimary) cssVars['--font-primary'] = cfg.fontPrimary;
  if (cfg.fontSecondary) cssVars['--font-secondary'] = cfg.fontSecondary;
  if (typeof cfg.overlayTitleSize === 'number' && Number.isFinite(cfg.overlayTitleSize)) cssVars['--title-size'] = `${Math.max(12, Math.min(64, Math.round(cfg.overlayTitleSize)))}px`;
  if (typeof cfg.overlaySubtitleSize === 'number' && Number.isFinite(cfg.overlaySubtitleSize)) cssVars['--subtitle-size'] = `${Math.max(10, Math.min(48, Math.round(cfg.overlaySubtitleSize)))}px`;

  const activeThumbGradient = (primary && accent) ? `linear-gradient(135deg, ${primary}, ${accent})` : null;

  return { cssVars, derived: { btnText, muted, activeThumbGradient } };
}

/**
 * Compute background/effect CSS vars and classes from partial config.
 * Pure helper so it can be unit tested independently.
 */
export function computeBackgroundOutcome(cfg: Partial<ThemeConfig>): { cssVars: Record<string,string>; classes: Record<string,boolean> } {
  const cssVars: Record<string,string> = {};
  if (cfg.appBg1) cssVars['--app-bg1'] = normalizeHex(String(cfg.appBg1)) || String(cfg.appBg1);
  if (cfg.appBg2) cssVars['--app-bg2'] = normalizeHex(String(cfg.appBg2)) || String(cfg.appBg2);
  if (cfg.effectColor) cssVars['--effect-color'] = normalizeHex(String(cfg.effectColor)) || String(cfg.effectColor);

  // particles / visual mode flags are not part of ThemeConfig yet; allow flexible keys
  const anyCfg = cfg as Record<string, unknown>;
  const classes: Record<string, boolean> = {};
  classes['particles-on'] = Boolean(anyCfg['particlesOn']) || Boolean(anyCfg['particles']);
  classes['dark-mode'] = (typeof anyCfg['mode'] === 'string' && anyCfg['mode'] === 'dark');

  return { cssVars, classes };
}

/**
 * Compute particles/mode related classes and css vars.
 * Pure helper to decide whether particles should run, whether canvas/gradient/off
 * is the active mode, and whether reduced-motion should force a fallback.
 */
export function computeParticlesOutcome(cfg: Partial<ThemeConfig> & Record<string, unknown>): { cssVars: Record<string,string>; classes: Record<string,boolean>; mode: 'particles'|'gradient'|'off' } {
  const cssVars: Record<string,string> = {};
  const anyCfg = (cfg || {}) as Record<string, unknown>;

  // Accept explicit 'mode' (gradient|particles|off) or flexible booleans
  let mode: 'particles'|'gradient'|'off' = 'gradient';
  const modeHint = typeof anyCfg['mode'] === 'string' ? String(anyCfg['mode']) : undefined;
  const bgHint = typeof anyCfg['bg'] === 'string' ? String(anyCfg['bg']) : undefined;
  if (modeHint === 'particles' || bgHint === 'particles') mode = 'particles';
  else if (modeHint === 'off' || bgHint === 'off') mode = 'off';

  // Respect prefers-reduced-motion if present in cfg or via a runtime hint
  const prefersReduced = Boolean(anyCfg['prefersReduced']) || (typeof window !== 'undefined' && (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches));
  if (prefersReduced && mode === 'particles') mode = 'gradient';

  const classes: Record<string,boolean> = {
    'particles-on': mode === 'particles',
    'bg-gradient': mode === 'gradient',
    'bg-off': mode === 'off'
  };

  // Allow effectColor to flow through for particle color usage
  if (typeof cfg.effectColor === 'string') {
    const eff = normalizeHex(cfg.effectColor) || cfg.effectColor;
    if (eff) cssVars['--effect-color'] = eff;
  }

  return { cssVars, classes, mode };
}

/**
 * DOM-wiring wrapper for particles/mode. Applies css vars and toggles classes on root.
 */
export function applyParticlesAndMode(cfg: Partial<ThemeConfig> & Record<string, unknown>): { cssVars: Record<string,string>; classes: Record<string,boolean>; mode: 'particles'|'gradient'|'off' } {
  const outcome = computeParticlesOutcome(cfg);
  try {
    const root = document && document.documentElement;
    if (root) {
      for (const [k, v] of Object.entries(outcome.cssVars)) {
        if (typeof v === 'string' && v.trim()) root.style.setProperty(k, v);
      }
      // Toggle classes: particles-on, bg-gradient, bg-off
      for (const [cls, on] of Object.entries(outcome.classes)) {
        if (on) root.classList.add(cls); else root.classList.remove(cls);
      }
    }
  } catch (e) {
    // ignore DOM errors in non-browser environments
  }
  return outcome;
}

/**
 * Compute next background mode given current mode.
 * Cycle order: gradient -> particles -> off -> gradient
 * Pure utility to be used by UI wiring.
 */
export function nextBackgroundMode(current?: string): 'particles'|'gradient'|'off' {
  const order: Array<'gradient'|'particles'|'off'> = ['gradient','particles','off'];
  const cur = (current ?? 'gradient') as string;
  const curMode = (cur === 'particles' || cur === 'gradient' || cur === 'off') ? cur as 'particles'|'gradient'|'off' : 'gradient';
  const idx = Math.max(0, order.indexOf(curMode));
  return order[(idx + 1) % order.length];
}

/**
 * DOM-wiring: set background mode, persist to localStorage under 'bgMode', and apply via applyParticlesAndMode.
 * Returns the applied mode and the apply outcome. No-op in non-DOM environments.
 */
export function setBackgroundMode(mode: 'particles'|'gradient'|'off'): { mode: 'particles'|'gradient'|'off'; outcome: ReturnType<typeof applyParticlesAndMode> | null } {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('bgMode', mode);
    }
    // delegate to applyParticlesAndMode for DOM changes
  const outcome = applyParticlesAndMode({ mode } as Partial<ThemeConfig> & Record<string, unknown>);
    return { mode: outcome.mode, outcome };
  } catch (e) {
    return { mode, outcome: null };
  }
}

/**
 * Compute particle system configuration from partial ThemeConfig or runtime hints.
 * Pure helper returning sanitized numeric values and colors.
 */
export function computeParticleConfig(cfg: Partial<ThemeConfig> & Record<string, unknown>) {
  const anyCfg = (cfg || {}) as Record<string, unknown>;
  // Respect reduced-motion preference from cfg hint or runtime matchMedia
  const prefersReduced = Boolean(anyCfg['prefersReduced']) || (typeof window !== 'undefined' && typeof (window.matchMedia) === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Defaults tuned to original app: fewer particles when reduced-motion
  const defaults = prefersReduced ? { count: 30, gridSize: 160, maxVelocity: 0.3, lineDistance: 90 } : { count: 90, gridSize: 120, maxVelocity: 0.6, lineDistance: 140 };

  const asNum = (k: string, fallback?: number) => {
    const v = anyCfg[k];
  const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const count = ((): number => {
    const n = asNum('particleCount');
    return typeof n === 'number' ? Math.max(0, Math.min(500, Math.round(n))) : defaults.count;
  })();
  const gridSize = ((): number => {
    const n = asNum('gridSize');
    return typeof n === 'number' ? Math.max(40, Math.min(400, Math.round(n))) : defaults.gridSize;
  })();
  const maxVelocity = ((): number => {
    const n = asNum('maxVelocity');
    return typeof n === 'number' ? Math.max(0.05, Math.min(4, n)) : defaults.maxVelocity;
  })();
  const lineDistance = ((): number => {
    const n = asNum('lineDistance');
    return typeof n === 'number' ? Math.max(10, Math.min(400, Math.round(n))) : defaults.lineDistance;
  })();

  const effectColor = anyCfg['effectColor'] ? (normalizeHex(String(anyCfg['effectColor'])) || String(anyCfg['effectColor'])) : (cfg.effectColor ? normalizeHex(cfg.effectColor) : undefined);

  return { count, gridSize, maxVelocity, lineDistance, effectColor, prefersReduced };
}

/**
 * DOM-wiring wrapper for background/effects. Sets CSS vars and toggles classes on root.
 * Returns the computed outcome (pure data) and no-ops in non-DOM environments.
 */
export function applyBackgroundAndEffects(cfg: Partial<ThemeConfig>): { cssVars: Record<string,string>; classes: Record<string,boolean> } {
  const outcome = computeBackgroundOutcome(cfg);
  try {
    const root = document && document.documentElement;
    if (root) {
      for (const [k, v] of Object.entries(outcome.cssVars)) {
        if (typeof v === 'string' && v.trim()) root.style.setProperty(k, v);
      }
      for (const [cls, on] of Object.entries(outcome.classes)) {
        if (on) root.classList.add(cls); else root.classList.remove(cls);
      }
    }
  } catch {
    // noop in non-browser environments
  }
  return outcome;
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
  const out = { ...cfg } as Record<string, unknown>;
  // appName from brand fallback (do not delete brand here)
  if (typeof out['appName'] !== 'string' && typeof out['brand'] === 'string') {
    (out as Record<string, unknown>)['appName'] = out['brand'];
  }
  if (typeof out['slideBorderOn'] !== 'boolean') out['slideBorderOn'] = true;
  const sbw = out['slideBorderWidth'];
  if (typeof sbw !== 'number' || !Number.isFinite(sbw)) out['slideBorderWidth'] = 3;
  const ots = out['overlayTitleSize'];
  if (typeof ots !== 'number' || !Number.isFinite(ots)) out['overlayTitleSize'] = 22;
  if (typeof out['overlaySubtitleOn'] !== 'boolean') out['overlaySubtitleOn'] = true;
  const oss = out['overlaySubtitleSize'];
  if (typeof oss !== 'number' || !Number.isFinite(oss)) out['overlaySubtitleSize'] = 16;
  if (typeof out['overlaySubtitleColor'] !== 'string') out['overlaySubtitleColor'] = 'primary';
  if (typeof out['fontPrimary'] !== 'string') out['fontPrimary'] = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  if (typeof out['fontSecondary'] !== 'string') out['fontSecondary'] = 'Arial, Helvetica, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
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
  if (typeof cfg.slideOpacity === 'number' && Number.isFinite(cfg.slideOpacity)) {
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
export function setColorProperty(property: string, value: unknown): void {
  try {
    if (typeof document === 'undefined' || !document.documentElement) return;
    if (typeof value === 'string' && value.trim()) {
      document.documentElement.style.setProperty(property, value.trim());
    }
  } catch {
    // noop for SSR / non-DOM environments
  }
}

/**
 * Sets a CSS custom property to a pixel value with safe numeric clamping.
 * @param property CSS custom property name (e.g., '--title-size')
 * @param value The numeric value to clamp and set
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 */
export function setPixelProperty(property: string, value: unknown, min: number, max: number): void {
  try {
    if (typeof document === 'undefined' || !document.documentElement) return;
    if (typeof value === 'number' && Number.isFinite(value)) {
      const clamped = Math.max(min, Math.min(max, Math.round(value)));
      document.documentElement.style.setProperty(property, `${clamped}px`);
    }
  } catch {
    // noop for SSR / non-DOM environments
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
