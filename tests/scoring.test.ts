import { describe, expect, it } from 'vitest';
import { ComboScorer } from '../src/systems/scoring';

const cfg = { windowMs: 2000, maxMultiplier: 5 };

describe('ComboScorer', () => {
  it('first catch scores base points at multiplier 1', () => {
    const scorer = new ComboScorer(cfg);
    const res = scorer.registerCatch(10, 0);
    expect(res).toEqual({ points: 10, multiplier: 1, combo: 1 });
    expect(scorer.score).toBe(10);
  });

  it('chained catches inside the window escalate the multiplier', () => {
    const scorer = new ComboScorer(cfg);
    scorer.registerCatch(10, 0);
    const second = scorer.registerCatch(10, 1000);
    const third = scorer.registerCatch(10, 1500);
    expect(second).toEqual({ points: 20, multiplier: 2, combo: 2 });
    expect(third).toEqual({ points: 30, multiplier: 3, combo: 3 });
    expect(scorer.score).toBe(10 + 20 + 30);
  });

  it('a catch after the window restarts the chain', () => {
    const scorer = new ComboScorer(cfg);
    scorer.registerCatch(10, 0);
    scorer.registerCatch(10, 1000); // combo 2
    const late = scorer.registerCatch(10, 1000 + cfg.windowMs + 1);
    expect(late.combo).toBe(1);
    expect(late.multiplier).toBe(1);
  });

  it('a catch exactly at the window edge still chains', () => {
    const scorer = new ComboScorer(cfg);
    scorer.registerCatch(10, 0);
    const edge = scorer.registerCatch(10, cfg.windowMs);
    expect(edge.combo).toBe(2);
  });

  it('multiplier caps at maxMultiplier', () => {
    const scorer = new ComboScorer(cfg);
    let last = { multiplier: 0 };
    for (let i = 0; i < 8; i++) {
      last = scorer.registerCatch(10, i * 100);
    }
    expect(last.multiplier).toBe(cfg.maxMultiplier);
    expect(scorer.combo).toBe(8); // combo keeps counting, multiplier is capped
  });

  it('breakCombo resets the chain but keeps the score', () => {
    const scorer = new ComboScorer(cfg);
    scorer.registerCatch(10, 0);
    scorer.registerCatch(10, 500);
    const before = scorer.score;
    scorer.breakCombo();
    expect(scorer.score).toBe(before);
    const next = scorer.registerCatch(10, 600);
    expect(next.combo).toBe(1);
  });

  it('expireIfStale clears an idle chain', () => {
    const scorer = new ComboScorer(cfg);
    scorer.registerCatch(10, 0);
    scorer.expireIfStale(cfg.windowMs + 1);
    expect(scorer.combo).toBe(0);
    const next = scorer.registerCatch(10, cfg.windowMs + 2);
    expect(next.combo).toBe(1);
  });

  it('reset zeroes everything', () => {
    const scorer = new ComboScorer(cfg);
    scorer.registerCatch(10, 0);
    scorer.reset();
    expect(scorer.score).toBe(0);
    expect(scorer.combo).toBe(0);
  });
});
