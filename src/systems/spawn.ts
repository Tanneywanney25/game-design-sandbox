import type { FruitType } from '../config';

/**
 * Pick a fruit type by relative weight. Weights of 0 disable a type;
 * throws when every weight is 0 (a config error worth failing loudly on).
 */
export function pickWeighted(
  rng: () => number,
  weights: Record<FruitType, number>,
): FruitType {
  const entries = Object.entries(weights) as [FruitType, number][];
  const total = entries.reduce((sum, [, w]) => sum + Math.max(0, w), 0);
  if (total <= 0) throw new Error('pickWeighted: all weights are zero');
  let roll = rng() * total;
  for (const [type, w] of entries) {
    roll -= Math.max(0, w);
    if (roll < 0) return type;
  }
  // Float edge: fall back to the last entry.
  return entries[entries.length - 1]![0];
}

export interface SchedulerConfig {
  intervalMs: number;
  jitterMs: number;
}

/** Emits spawn ticks separated by `intervalMs` plus a random jitter slice. */
export class SpawnScheduler {
  private timerMs = 0;
  private nextDelayMs: number;

  constructor(
    private cfg: SchedulerConfig,
    private readonly rng: () => number,
  ) {
    this.nextDelayMs = this.rollDelay();
  }

  private rollDelay(): number {
    return this.cfg.intervalMs + this.rng() * this.cfg.jitterMs;
  }

  /** Update the base interval live (settings panel). */
  setInterval(intervalMs: number): void {
    this.cfg = { ...this.cfg, intervalMs };
  }

  /** Advance by dt ms; returns true when a spawn is due. */
  advance(dtMs: number): boolean {
    this.timerMs += dtMs;
    if (this.timerMs < this.nextDelayMs) return false;
    this.timerMs -= this.nextDelayMs;
    this.nextDelayMs = this.rollDelay();
    return true;
  }

  reset(): void {
    this.timerMs = 0;
    this.nextDelayMs = this.rollDelay();
  }
}
