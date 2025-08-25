import { describe, it, expect } from 'vitest';
import { buildSlideOpacityCss } from '../../src/app/theme';

describe('buildSlideOpacityCss', () => {
  it('computes rgba strings and blur for 100%', () => {
    const out = buildSlideOpacityCss(100, '#112233', '#445566');
    expect(out.dec).toBe(1);
    expect(out.slideBg1Rgba).toContain('rgba(');
    expect(out.blurPx).toBe('8.00px');
  });

  it('clamps percent below 0 to 0', () => {
    const out = buildSlideOpacityCss(-10);
    expect(out.dec).toBe(0);
  });
});
