import { describe, it, expect } from 'vitest';
import { computeThemeCssVars, normalizeHex } from '../src/app/theme';

describe('computeThemeCssVars: btnTextColor and text preservation', () => {
  it('btnTextColor:auto picks white on dark average', () => {
    const out = computeThemeCssVars({ primary: '#0f172a', accent: '#1e293b', btnTextColor: 'auto' });
    expect(normalizeHex(out.cssVars['--btn-text'])).toBe('#ffffff');
  });

  it('btnTextColor:auto picks black on light average', () => {
    const out = computeThemeCssVars({ primary: '#f9fafb', accent: '#e5e7eb', btnTextColor: 'auto' });
    expect(normalizeHex(out.cssVars['--btn-text'])).toBe('#000000');
  });

  it('btnTextColor explicit hex overrides auto logic', () => {
    const out = computeThemeCssVars({ primary: '#0f172a', accent: '#1e293b', btnTextColor: '#ff00ff' });
    expect(normalizeHex(out.cssVars['--btn-text'])).toBe('#ff00ff');
  });

  it('textColor preserves rgb(...) values', () => {
    const out = computeThemeCssVars({ textColor: 'rgb(10, 20, 30)' });
    expect(out.cssVars['--text']).toBe('rgb(10, 20, 30)');
  });
});

