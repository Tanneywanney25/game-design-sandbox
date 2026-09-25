export interface ComboConfig {
  windowMs: number;
  maxMultiplier: number;
}

export interface CatchResult {
  /** Points awarded for this catch (base × multiplier). */
  points: number;
  multiplier: number;
  /** Consecutive catches inside the combo window. */
  combo: number;
}

/**
 * Combo scoring: consecutive catches within `windowMs` of each other raise the
 * multiplier by one per catch, capped at `maxMultiplier`. A miss or an idle gap
 * longer than the window resets the chain.
 */
export class ComboScorer {
  score = 0;
  private comboCount = 0;
  private lastCatchAt: number | null = null;

  constructor(private readonly cfg: ComboConfig) {}

  get combo(): number {
    return this.comboCount;
  }

  get multiplier(): number {
    return Math.max(1, Math.min(this.comboCount, this.cfg.maxMultiplier));
  }

  /** Call when the player catches a fruit. `nowMs` is any monotonic clock. */
  registerCatch(basePoints: number, nowMs: number): CatchResult {
    const chained =
      this.lastCatchAt !== null && nowMs - this.lastCatchAt <= this.cfg.windowMs;
    this.comboCount = chained ? this.comboCount + 1 : 1;
    this.lastCatchAt = nowMs;
    const multiplier = this.multiplier;
    const points = basePoints * multiplier;
    this.score += points;
    return { points, multiplier, combo: this.comboCount };
  }

  /** Call when a fruit is missed — breaks the chain immediately. */
  breakCombo(): void {
    this.comboCount = 0;
    this.lastCatchAt = null;
  }

  /** Poll periodically: expires the chain when the window has lapsed. */
  expireIfStale(nowMs: number): void {
    if (this.lastCatchAt !== null && nowMs - this.lastCatchAt > this.cfg.windowMs) {
      this.comboCount = 0;
      this.lastCatchAt = null;
    }
  }

  reset(): void {
    this.score = 0;
    this.breakCombo();
  }
}
