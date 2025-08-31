import { describe, it, expect } from 'vitest';
import { computeBtnTextColor, normalizeHex } from '../src/app/theme';

describe('button text color (auto/custom)', () => {
  it('auto chooses white on dark avg', () => {
    const c = computeBtnTextColor('#0f172a', '#1e293b');
    expect(normalizeHex(c)).toBe('#ffffff');
  });
  it('auto chooses black on light avg', () => {
    const c = computeBtnTextColor('#f9fafb', '#e5e7eb');
    expect(normalizeHex(c)).toBe('#000000');
  });
  it('custom explicit overrides auto', () => {
    const c = computeBtnTextColor('#0f172a', '#1e293b', '#ff00ff');
    expect(normalizeHex(c)).toBe('#ff00ff');
  });
});

