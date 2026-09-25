import type { FruitSpec, FruitType, GameConfig } from '../config';
import { randRange } from '../core/rng';

/** A fruit travelling across the canvas from its spawn edge. */
export class Fruit {
  x: number;
  y: number;
  vx = 0;
  vy = 0;

  constructor(
    readonly type: FruitType,
    readonly spec: FruitSpec,
    cfg: GameConfig,
    rng: () => number,
  ) {
    const { width, height } = cfg.canvas;
    const s = spec.size;
    switch (spec.edge) {
      case 'left':
        this.x = -s;
        this.y = randRange(rng, 120, height - 160);
        this.vx = spec.speed;
        break;
      case 'right':
        this.x = width + s;
        this.y = randRange(rng, 120, height - 160);
        this.vx = -spec.speed;
        break;
      case 'bottom':
        this.x = randRange(rng, 80, width - 80);
        this.y = height + s;
        this.vy = -spec.speed;
        break;
    }
  }

  update(dtSeconds: number): void {
    this.x += this.vx * dtSeconds;
    this.y += this.vy * dtSeconds;
  }

  /** True once the fruit has fully exited on its travel side. */
  offscreen(cfg: GameConfig): boolean {
    const s = this.spec.size;
    if (this.vx > 0) return this.x - s > cfg.canvas.width;
    if (this.vx < 0) return this.x + s < 0;
    return this.y + s < 0;
  }
}

export interface SlicerState {
  x: number;
  y: number;
  size: number;
}

/** Circle-style catch test between the slicer and a fruit. */
export function isCaught(slicer: SlicerState, fruit: Fruit): boolean {
  const reach = (slicer.size + fruit.spec.size) * 0.35;
  return Math.hypot(fruit.x - slicer.x, fruit.y - slicer.y) < reach;
}
