import type p5 from 'p5';
import type { FruitType, GameConfig } from './config';
import { Fruit, isCaught, type SlicerState } from './entities/fruit';
import { pickWeighted, type SpawnScheduler } from './systems/spawn';
import type { ComboScorer } from './systems/scoring';
import type { Lives } from './systems/lives';

export type GameState = 'menu' | 'playing' | 'gameover';

interface FloatingText {
  x: number;
  y: number;
  text: string;
  ttlMs: number;
}

export interface SketchDeps {
  cfg: GameConfig;
  scorer: ComboScorer;
  lives: Lives;
  scheduler: SpawnScheduler;
  /** Live spawn weights — the settings panel mutates this object. */
  weights: Record<FruitType, number>;
  rng: () => number;
  onHud: (state: GameState) => void;
  onGameOver: (score: number) => void;
}

/** p5 instance-mode sketch: rendering + input on top of the pure systems. */
export function createSketch(deps: SketchDeps): (p: p5) => void {
  return (p: p5): void => {
    const { cfg, scorer, lives, scheduler, rng } = deps;
    let state: GameState = 'menu';
    let fruits: Fruit[] = [];
    let fx: FloatingText[] = [];
    const images: Partial<Record<FruitType | 'background' | 'slicer', p5.Image>> = {};
    const slicer: SlicerState = {
      x: cfg.canvas.width / 2,
      y: cfg.canvas.height / 2,
      size: cfg.slicer.size,
    };

    p.preload = () => {
      images.background = p.loadImage('/assets/background.png');
      images.slicer = p.loadImage('/assets/slicer.png');
      images.melon = p.loadImage('/assets/melon.png');
      images.pear = p.loadImage('/assets/pear.png');
      images.pomegranate = p.loadImage('/assets/pomegranate.png');
    };

    p.setup = () => {
      p.createCanvas(cfg.canvas.width, cfg.canvas.height).parent('stage');
      p.textFont('Segoe UI, system-ui, sans-serif');
      p.imageMode(p.CENTER);
    };

    function startRun(): void {
      scorer.reset();
      lives.reset();
      scheduler.reset();
      fruits = [];
      fx = [];
      slicer.x = cfg.canvas.width / 2;
      slicer.y = cfg.canvas.height / 2;
      state = 'playing';
    }

    p.keyPressed = (event?: KeyboardEvent) => {
      if (p.key === ' ') {
        if (state !== 'playing') startRun();
        event?.preventDefault(); // keep the page from scrolling
      }
    };

    function moveSlicer(dt: number): void {
      const v = cfg.slicer.speed * dt;
      const left = p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(65);
      const right = p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(68);
      const up = p.keyIsDown(p.UP_ARROW) || p.keyIsDown(87);
      const down = p.keyIsDown(p.DOWN_ARROW) || p.keyIsDown(83);
      if (left) slicer.x -= v;
      if (right) slicer.x += v;
      if (up) slicer.y -= v;
      if (down) slicer.y += v;
      slicer.x = p.constrain(slicer.x, 0, cfg.canvas.width);
      slicer.y = p.constrain(slicer.y, 0, cfg.canvas.height);
    }

    function updatePlaying(dtMs: number): void {
      const dt = dtMs / 1000;
      moveSlicer(dt);

      if (scheduler.advance(dtMs)) {
        const type = pickWeighted(rng, deps.weights);
        fruits.push(new Fruit(type, cfg.fruits[type], cfg, rng));
      }

      const survivors: Fruit[] = [];
      for (const fruit of fruits) {
        fruit.update(dt);
        if (isCaught(slicer, fruit)) {
          const result = scorer.registerCatch(fruit.spec.points, p.millis());
          fx.push({
            x: fruit.x,
            y: fruit.y,
            text: result.multiplier > 1 ? `+${result.points} ×${result.multiplier}` : `+${result.points}`,
            ttlMs: 900,
          });
        } else if (fruit.offscreen(cfg)) {
          scorer.breakCombo();
          const ended = lives.loseOne();
          fx.push({ x: slicer.x, y: slicer.y - 70, text: '−1 ♥', ttlMs: 900 });
          if (ended) {
            state = 'gameover';
            deps.onGameOver(scorer.score);
          }
        } else {
          survivors.push(fruit);
        }
      }
      fruits = survivors;
      scorer.expireIfStale(p.millis());

      for (const f of fx) f.ttlMs -= dtMs;
      fx = fx.filter((f) => f.ttlMs > 0);
    }

    function drawWorld(): void {
      const bg = images.background;
      if (bg) p.image(bg, cfg.canvas.width / 2, cfg.canvas.height / 2, cfg.canvas.width, cfg.canvas.height);
      for (const fruit of fruits) {
        const img = images[fruit.type];
        if (img) p.image(img, fruit.x, fruit.y, fruit.spec.size, fruit.spec.size);
      }
      const slicerImg = images.slicer;
      if (slicerImg && state !== 'menu') {
        p.image(slicerImg, slicer.x, slicer.y, slicer.size, slicer.size);
      }
      p.fill(255);
      p.stroke(0);
      p.strokeWeight(3);
      p.textSize(22);
      p.textAlign(p.CENTER);
      for (const f of fx) {
        p.text(f.text, f.x, f.y - (900 - f.ttlMs) / 18);
      }
      p.noStroke();
    }

    function drawOverlay(title: string, subtitle: string): void {
      p.fill(0, 0, 0, 140);
      p.rect(0, 0, cfg.canvas.width, cfg.canvas.height);
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(46);
      p.text(title, cfg.canvas.width / 2, cfg.canvas.height / 2 - 30);
      p.textSize(20);
      p.text(subtitle, cfg.canvas.width / 2, cfg.canvas.height / 2 + 16);
    }

    p.draw = () => {
      const dtMs = Math.min(p.deltaTime, 100);
      if (state === 'playing') updatePlaying(dtMs);
      drawWorld();
      if (state === 'menu') {
        drawOverlay('Fruit Rush', 'Arrows/WASD to move — catch fruit, chain combos. Space to start.');
      } else if (state === 'gameover') {
        drawOverlay('Game over', `Score ${scorer.score} — Space to play again`);
      }
      deps.onHud(state);
    };
  };
}
