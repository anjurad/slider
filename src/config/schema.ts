// Centralized config schema and helpers for Slider
// Provides types, normalizers, and merge/validate used by runtime and dev-tools

export type ThemeConfig = {
  appName?: string;
  brand?: string; // legacy alias
  primary?: string;
  accent?: string;
  textColor?: string;
  btnTextColor?: string; // 'auto' or hex
  btnFill?: 'solid' | 'outline';
  appBg1?: string;
  appBg2?: string;
  slideBg1?: string;
  slideBg2?: string;
  slideOpacity?: number; // decimal 0..1
  slideBorderOn?: boolean;
  slideBorderWidth?: number; // px
  overlayOn?: boolean;
  overlayPos?: 'tl'|'tr'|'bl'|'br';
  overlayTitleSize?: number; // px
  overlaySubtitleOn?: boolean;
  overlaySubtitleSize?: number; // px
  overlaySubtitleColor?: 'primary'|'accent';
  fontPrimary?: string;
  fontSecondary?: string;
  rememberLastDeck?: boolean;
  hideSlidesWithUi?: boolean;
  hideProgressWithUi?: boolean;
  contentPos?: 'tl'|'tm'|'tr'|'ml'|'mm'|'mr'|'bl'|'bm'|'br';
};

// Reuse normalizeHex from shared core when present; fallback local implementation
function normalizeHexLocal(input: unknown): string {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const Core = typeof window !== 'undefined' ? (window as any).ThemeCore : undefined;
    if (Core && typeof Core.normalizeHex === 'function') return Core.normalizeHex(input);
  } catch (e) { /* noop */ void 0; }
  try {
    if (!input) return '';
    let s = String(input).trim().replace(/^['"]|['"]$/g, '');
    if (!s) return '';
    if (!s.startsWith('#')) s = '#' + s;
    const m = s.slice(1);
    if (/^[0-9a-f]{3}$/i.test(m)) return '#' + m.split('').map(c=>c+c).join('').toLowerCase();
    if (/^[0-9a-f]{6}$/i.test(m)) return '#' + m.toLowerCase();
  } catch (e) { /* noop */ void 0; }
  return '';
}

export function sanitizeConfig(input: unknown): Partial<ThemeConfig> {
  const out: Partial<ThemeConfig> = {};
  const outRec = out as Record<string, unknown>;
  if (!input || typeof input !== 'object') return out;
  const obj = input as Record<string, unknown>;
  const setStr = (k: keyof ThemeConfig) => { const v = obj[k as string]; if (typeof v === 'string' && v.trim()) outRec[k as string] = v.trim(); };
  const setHex = (k: keyof ThemeConfig) => { const v = obj[k as string]; if (typeof v === 'string') { const n = normalizeHexLocal(v); if (n) outRec[k as string] = n; } };
  const setBool = (k: keyof ThemeConfig) => { const v = obj[k as string]; if (typeof v === 'boolean') outRec[k as string] = v; };
  const setNum = (k: keyof ThemeConfig, min?: number, max?: number) => { const v = Number(obj[k as string]); if (Number.isFinite(v)) { let n=v; if (typeof min==='number') n=Math.max(min,n); if(typeof max==='number') n=Math.min(max,n); outRec[k as string] = n; } };

  // strings
  ['appName','brand','overlayPos','fontPrimary','fontSecondary','contentPos'].forEach(k => setStr(k as keyof ThemeConfig));
  // colors
  ['primary','accent','textColor','appBg1','appBg2','slideBg1','slideBg2'].forEach(k => setHex(k as keyof ThemeConfig));
  // btnTextColor: allow 'auto' or hex
  if (typeof obj.btnTextColor === 'string') {
    const raw = obj.btnTextColor.trim();
    if (/^auto$/i.test(raw)) out.btnTextColor = 'auto'; else { const n = normalizeHexLocal(raw); if (n) out.btnTextColor = n; }
  }
  // enums
  if (typeof obj.btnFill === 'string' && /^(solid|outline)$/i.test(String(obj.btnFill))) out.btnFill = String(obj.btnFill).toLowerCase() as any;
  if (typeof obj.overlaySubtitleColor === 'string' && /^(primary|accent)$/i.test(String(obj.overlaySubtitleColor))) out.overlaySubtitleColor = String(obj.overlaySubtitleColor).toLowerCase() as any;
  // numbers
  setNum('slideOpacity', 0, 1);
  setNum('slideBorderWidth', 0, 8);
  setNum('overlayTitleSize', 12, 64);
  setNum('overlaySubtitleSize', 10, 48);
  // booleans
  ['slideBorderOn','overlayOn','overlaySubtitleOn','rememberLastDeck','hideSlidesWithUi','hideProgressWithUi'].forEach(k => setBool(k as keyof ThemeConfig));
  return out;
}

export function mergeConfig(base: Partial<ThemeConfig>, incoming: unknown, mode: 'merge'|'replace'='merge'): Partial<ThemeConfig> {
  const safe = sanitizeConfig(incoming);
  const next: Partial<ThemeConfig> = (mode === 'replace') ? {} : { ...(base || {}) };
  return Object.assign(next, safe);
}

export function isThemeConfig(obj: unknown): obj is ThemeConfig {
  return !!obj && typeof obj === 'object';
}
