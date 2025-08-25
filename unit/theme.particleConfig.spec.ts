/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { computeParticleConfig } from '../../src/app/theme';

describe('computeParticleConfig', () => {
  it('returns defaults for normal motion', () => {
    const cfg = computeParticleConfig({} as any);
    expect(cfg.count).toBeGreaterThan(0);
    expect(cfg.gridSize).toBeGreaterThan(0);
    expect(typeof cfg.maxVelocity).toBe('number');
    expect(cfg.prefersReduced).toBe(false);
  });

  it('honors explicit overrides and clamps values', () => {
    const cfg = computeParticleConfig({ particleCount: 3000, gridSize: 10, maxVelocity: 10, lineDistance: 1000, effectColor: '#123' } as any);
    expect(cfg.count).toBeLessThanOrEqual(500);
    expect(cfg.gridSize).toBeGreaterThanOrEqual(40);
    expect(cfg.maxVelocity).toBeLessThanOrEqual(4);
    expect(cfg.lineDistance).toBeLessThanOrEqual(400);
    expect(cfg.effectColor).toBe('#112233');
  });

  it('reduces defaults when prefersReduced is true', () => {
    const cfg = computeParticleConfig({ prefersReduced: true } as any);
    expect(cfg.prefersReduced).toBe(true);
    expect(cfg.count).toBeLessThan(100);
  });
});
