/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { setSlideOpacityPure, setSlideOpacity } from '../../src/app/theme';

// jsdom-like environment provided by Vitest should expose document

describe('setSlideOpacity helpers', () => {
  beforeEach(() => {
    // reset CSS vars
    document.documentElement.style.removeProperty('--slide-bg1');
    document.documentElement.style.removeProperty('--slide-bg2');
    document.documentElement.style.removeProperty('--slide-blur');
    document.documentElement.style.removeProperty('--slide-shadow');
    document.documentElement.style.removeProperty('--slide-opacity');
  });

  it('setSlideOpacityPure returns expected rgba strings and values for percent input', () => {
    const out = setSlideOpacityPure(60, '#112233', '#445566');
    // Implementation uses multipliers 0.75 and 0.55 for base opacities
    expect(out.slideBg1Rgba).toMatch(/^rgba\(17,34,51,0\.45/);
    expect(out.slideBg2Rgba).toMatch(/^rgba\(68,85,102,0\.33/);
    expect(out.blurPx).toBeDefined();
    expect(out.shadow).toContain('rgba(0,0,0');
  });

  it('setSlideOpacity accepts decimal 0..1 and sets CSS vars', () => {
    const out = setSlideOpacity(0.5, '#112233', '#445566');
    expect(out.dec).toBeCloseTo(0.5, 2);
    expect(document.documentElement.style.getPropertyValue('--slide-bg1')).toContain('rgba(17,34,51');
    expect(document.documentElement.style.getPropertyValue('--slide-opacity')).toBe('0.5');
  });

  it('setSlideOpacity accepts percent 0..100 and clamps invalid inputs', () => {
    const out = setSlideOpacity('200', '#000000', '#ffffff');
    // 200 should clamp to 100
    expect(out.dec).toBe(1);
    expect(document.documentElement.style.getPropertyValue('--slide-opacity')).toBe('1');

    const out2 = setSlideOpacity('invalid');
    expect(out2.dec).toBe(1);
  });
});
