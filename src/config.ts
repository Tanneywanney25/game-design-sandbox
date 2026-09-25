/** Central configuration — all gameplay tunables in one typed place. */

export type FruitType = 'melon' | 'pear' | 'pomegranate';

export type SpawnEdge = 'left' | 'right' | 'bottom';

export interface FruitSpec {
  /** Base points before the combo multiplier. */
  points: number;
  /** Relative spawn weight (0 disables the type). */
  weight: number;
  /** Travel speed, px/s. */
  speed: number;
  /** Drawn size (square), px. */
  size: number;
  /** Which edge the fruit enters from. */
  edge: SpawnEdge;
}

export interface GameConfig {
  canvas: { width: number; height: number };
  slicer: { speed: number; size: number };
  spawn: {
    /** Base delay between spawns, ms. */
    intervalMs: number;
    /** Random extra delay added per spawn, ms. */
    jitterMs: number;
  };
  combo: {
    /** Max time between catches to keep a combo alive, ms. */
    windowMs: number;
    maxMultiplier: number;
  };
  lives: { start: number };
  fruits: Record<FruitType, FruitSpec>;
}

export const defaultConfig: GameConfig = {
  canvas: { width: 1000, height: 600 },
  slicer: { speed: 460, size: 96 },
  spawn: { intervalMs: 900, jitterMs: 400 },
  combo: { windowMs: 2000, maxMultiplier: 5 },
  lives: { start: 3 },
  fruits: {
    melon: { points: 10, weight: 4, speed: 240, size: 72, edge: 'left' },
    pear: { points: 15, weight: 3, speed: 280, size: 60, edge: 'right' },
    pomegranate: { points: 25, weight: 2, speed: 330, size: 56, edge: 'bottom' },
  },
};

export const FRUIT_TYPES: FruitType[] = ['melon', 'pear', 'pomegranate'];
