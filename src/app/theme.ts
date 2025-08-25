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

// TODO(next): Extract setSlideOpacity and applyConfig (ensure pure helpers where possible)
