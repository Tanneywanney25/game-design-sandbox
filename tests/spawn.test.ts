import { describe, expect, it } from 'vitest';
import { pickWeighted, SpawnScheduler } from '../src/systems/spawn';
import { mulberry32 } from '../src/core/rng';
import type { FruitType } from '../src/config';

describe('pickWeighted', () => {
  it('respects relative weights within tolerance over many draws', () => {
    const rng = mulberry32(1234);
    const weights = { melon: 4, pear: 3, pomegranate: 2 };
    const counts: Record<FruitType, number> = { melon: 0, pear: 0, pomegranate: 0 };
    const N = 20_000;
    for (let i = 0; i < N; i++) counts[pickWeighted(rng, weights)] += 1;
    const total = 4 + 3 + 2;
    expect(counts.melon / N).toBeCloseTo(4 / total, 1);
    expect(counts.pear / N).toBeCloseTo(3 / total, 1);
    expect(counts.pomegranate / N).toBeCloseTo(2 / total, 1);
  });

  it('never picks a zero-weight type', () => {
    const rng = mulberry32(99);
    const weights = { melon: 5, pear: 0, pomegranate: 5 };
    for (let i = 0; i < 5_000; i++) {
      expect(pickWeighted(rng, weights)).not.toBe('pear');
    }
  });

  it('treats negative weights as zero', () => {
    const rng = mulberry32(7);
    const weights = { melon: 1, pear: -10, pomegranate: 0 };
    for (let i = 0; i < 1_000; i++) {
      expect(pickWeighted(rng, weights)).toBe('melon');
    }
  });

  it('throws when all weights are zero', () => {
    expect(() => pickWeighted(mulberry32(1), { melon: 0, pear: 0, pomegranate: 0 })).toThrow();
  });

  it('is deterministic for a fixed seed', () => {
    const run = (): string[] => {
      const rng = mulberry32(42);
      const weights = { melon: 1, pear: 1, pomegranate: 1 };
      return Array.from({ length: 25 }, () => pickWeighted(rng, weights));
    };
    expect(run()).toEqual(run());
  });
});

describe('SpawnScheduler', () => {
  it('does not emit before the base interval elapses', () => {
    const scheduler = new SpawnScheduler({ intervalMs: 900, jitterMs: 0 }, mulberry32(1));
    expect(scheduler.advance(899)).toBe(false);
    expect(scheduler.advance(1)).toBe(true);
  });

  it('emits roughly elapsed/interval spawns with zero jitter', () => {
    const scheduler = new SpawnScheduler({ intervalMs: 500, jitterMs: 0 }, mulberry32(1));
    let spawns = 0;
    for (let t = 0; t < 10_000; t += 16) {
      if (scheduler.advance(16)) spawns += 1;
    }
    expect(spawns).toBe(Math.floor(10_000 / 500));
  });

  it('jitter delays stay within [interval, interval + jitter]', () => {
    const scheduler = new SpawnScheduler({ intervalMs: 400, jitterMs: 300 }, mulberry32(5));
    let sinceLast = 0;
    let checked = 0;
    for (let t = 0; t < 60_000 && checked < 30; t += 10) {
      sinceLast += 10;
      if (scheduler.advance(10)) {
        expect(sinceLast).toBeGreaterThanOrEqual(400);
        expect(sinceLast).toBeLessThanOrEqual(400 + 300 + 10);
        sinceLast = 0;
        checked += 1;
      }
    }
    expect(checked).toBe(30);
  });

  it('setInterval applies to subsequent delays', () => {
    const scheduler = new SpawnScheduler({ intervalMs: 1000, jitterMs: 0 }, mulberry32(1));
    scheduler.advance(1000); // consume first
    scheduler.setInterval(200);
    // next delay was already rolled at 1000ms; the one after uses 200ms
    expect(scheduler.advance(1000)).toBe(true);
    expect(scheduler.advance(200)).toBe(true);
  });

  it('reset restarts the timer', () => {
    const scheduler = new SpawnScheduler({ intervalMs: 500, jitterMs: 0 }, mulberry32(1));
    scheduler.advance(499);
    scheduler.reset();
    expect(scheduler.advance(499)).toBe(false);
    expect(scheduler.advance(1)).toBe(true);
  });
});
