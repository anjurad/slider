/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { computeParticlesOutcome, applyParticlesAndMode } from '../../src/app/theme';

describe('particles & mode compute/apply', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');
  });

  it('computeParticlesOutcome decides particles mode and exposes effect color', () => {
    const out = computeParticlesOutcome({ mode: 'particles', effectColor: '#112233' } as any);
    expect(out.mode).toBe('particles');
    expect(out.classes['particles-on']).toBe(true);
    expect(out.cssVars['--effect-color']).toBe('#112233');
  });

  it('applyParticlesAndMode writes cssVars and toggles classes; reduced-motion falls back to gradient', () => {
    const out = applyParticlesAndMode({ mode: 'particles', effectColor: '#334455', prefersReduced: true } as any);
    // compute-level outcome
    expect(out.mode).toBe('gradient');
    expect(out.classes['particles-on']).toBe(false);
    expect(out.classes['bg-gradient']).toBe(true);
    // DOM side effects
    const style = getComputedStyle(document.documentElement);
    expect(style.getPropertyValue('--effect-color').trim()).toBe('#334455');
    expect(document.documentElement.classList.contains('bg-gradient')).toBe(true);
  });
});
