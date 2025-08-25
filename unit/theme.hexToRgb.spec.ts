import { describe, it, expect } from 'vitest';
import { hexToRgb } from '../src/app/theme';

describe('hexToRgb', () => {
  it('parses #rrggbb correctly', () => {
    expect(hexToRgb('#112233')).toEqual({ r: 0x11, g: 0x22, b: 0x33 });
  });

  it('parses 3-digit hex via normalize', () => {
    expect(hexToRgb('#abc')).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('zzz')).toBeNull();
  });
});
