/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { computeBackgroundOutcome, applyBackgroundAndEffects } from '../src/app/theme';

describe('background & effects compute/apply', () => {
  beforeEach(() => {
    // reset root styles/classes
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');
  });

  it('computeBackgroundOutcome returns cssVars and classes', () => {
    const out = computeBackgroundOutcome({ appBg1: '#112233', effectColor: '#445566', particlesOn: true, mode: 'dark' } as any);
    expect(out.cssVars['--app-bg1']).toBe('#112233');
    expect(out.cssVars['--effect-color']).toBe('#445566');
    expect(out.classes['particles-on']).toBe(true);
    expect(out.classes['dark-mode']).toBe(true);
  });

  it('applyBackgroundAndEffects writes CSS vars and toggles classes on root', () => {
    const out = applyBackgroundAndEffects({ appBg1: '#112233', appBg2: '#334455', particles: true } as any);
    // returned values
    expect(out.cssVars['--app-bg1']).toBe('#112233');
    expect(out.cssVars['--app-bg2']).toBe('#334455');
    expect(out.classes['particles-on']).toBe(true);
    // DOM side effects
    const style = getComputedStyle(document.documentElement);
    expect(style.getPropertyValue('--app-bg1').trim()).toBe('#112233');
    expect(style.getPropertyValue('--app-bg2').trim()).toBe('#334455');
    expect(document.documentElement.classList.contains('particles-on')).toBe(true);
  });
});
