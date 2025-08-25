/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { nextBackgroundMode, setBackgroundMode } from '../src/app/theme';

describe('background mode helper and setter', () => {
  beforeEach(() => {
    // clear persisted prefs and DOM
    window.localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');
  });

  it('nextBackgroundMode cycles correctly', () => {
    expect(nextBackgroundMode('gradient')).toBe('particles');
    expect(nextBackgroundMode('particles')).toBe('off');
    expect(nextBackgroundMode('off')).toBe('gradient');
    expect(nextBackgroundMode(undefined)).toBe('particles');
  });

  it('setBackgroundMode persists and applies classes', () => {
    const res = setBackgroundMode('particles');
    expect(window.localStorage.getItem('bgMode')).toBe('particles');
    // applyParticlesAndMode should result in mode === 'particles'
    expect(res.mode).toBe('particles');
    expect(document.documentElement.classList.contains('particles-on')).toBe(true);
  });
});
