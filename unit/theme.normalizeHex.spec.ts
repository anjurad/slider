import { describe, it, expect } from 'vitest';
import { normalizeHex } from '../../src/app/theme';

describe('normalizeHex', () => {
  it('returns #rrggbb for 3-digit hex', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc');
  });

  it('lowercases and preserves 6-digit hex', () => {
    expect(normalizeHex('#A1B2C3')).toBe('#a1b2c3');
  });

  it('returns empty string for invalid input', () => {
    expect(normalizeHex('not-a-hex')).toBe('');
  });
});
