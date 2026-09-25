import p5 from 'p5';
import { defaultConfig } from './config';
import { mulberry32 } from './core/rng';
import { createSketch } from './sketch';
import { ComboScorer } from './systems/scoring';
import { Lives } from './systems/lives';
import { SpawnScheduler } from './systems/spawn';
import {
  readBest,
  readSettings,
  safeStorage,
  writeBest,
  writeSettings,
} from './systems/storage';
import { Hud } from './ui/hud';
import { buildSettingsPanel } from './ui/settings';

const cfg = defaultConfig;
const storage = safeStorage();

const settings = readSettings(storage, {
  spawnIntervalMs: cfg.spawn.intervalMs,
  weights: {
    melon: cfg.fruits.melon.weight,
    pear: cfg.fruits.pear.weight,
    pomegranate: cfg.fruits.pomegranate.weight,
  },
});

const rng = mulberry32(Date.now() >>> 0);
const scorer = new ComboScorer(cfg.combo);
const lives = new Lives(cfg.lives.start);
const scheduler = new SpawnScheduler(
  { intervalMs: settings.spawnIntervalMs, jitterMs: cfg.spawn.jitterMs },
  rng,
);

const hud = new Hud();
let best = readBest(storage);

const sketch = createSketch({
  cfg,
  scorer,
  lives,
  scheduler,
  weights: settings.weights,
  rng,
  onHud: () => {
    hud.update(scorer.score, scorer.combo, scorer.multiplier, lives.remaining, cfg.lives.start, best);
  },
  onGameOver: (score) => {
    writeBest(storage, score);
    best = readBest(storage);
  },
});

new p5(sketch);

const panel = document.querySelector<HTMLElement>('#settings-panel');
const toggle = document.querySelector<HTMLElement>('#settings-toggle');
if (panel && toggle) {
  buildSettingsPanel(panel, toggle, settings, (next) => {
    scheduler.setInterval(next.spawnIntervalMs);
    writeSettings(storage, next);
  });
}
