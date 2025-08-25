/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { applyFontOutline } from '../../src/app/theme';

describe('applyFontOutline', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.cssText = '';
  });

  it('applies font CSS vars and outline class', () => {
    const outcome = applyFontOutline({ fontPrimary: 'Inter, sans-serif', fontSecondary: 'Arial', slideBorderOn: false, slideBorderWidth: 5 });
    expect(document.documentElement.style.getPropertyValue('--font-primary')).toBe('Inter, sans-serif');
    expect(document.documentElement.style.getPropertyValue('--font-secondary')).toBe('Arial');
    expect(document.documentElement.style.getPropertyValue('--outline-w')).toBe('5px');
    expect(document.documentElement.classList.contains('border-off')).toBe(true);
    // outcome should reflect cssVars and classes
    expect(outcome.cssVars['--font-primary']).toBe('Inter, sans-serif');
    expect(outcome.classes['border-off']).toBe(true);
  });
});
