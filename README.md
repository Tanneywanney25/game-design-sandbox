# Fruit Rush (game-design-sandbox)

Fruit Rush is an arcade fruit-catching game rebuilt from a p5.js course sketch into a typed TypeScript project. Melons drift in from the left, pears from the right, and pomegranates launch up from the bottom, each with its own speed, size, point value, and spawn weight defined in a central config. You steer a slicer with the arrow keys or WASD and chain catches: every catch inside a two-second window raises a combo multiplier (capped at ×5), while a missed fruit breaks the chain and costs one of three lives. A DOM HUD tracks score, combo, hearts, and the localStorage best; a settings panel adjusts spawn rate and the fruit-mix weights live. The p5 layer only renders and reads input — scoring, weighted spawning, scheduling, and lives are pure modules covered by a Vitest suite, including a statistical test of the weighted picker. Vite, ESLint, Prettier, GitHub Actions CI, Vercel-ready.

## Controls

| Input | Action |
| --- | --- |
| Arrow keys / WASD | Move the slicer |
| `Space` | Start · restart |
| Settings button | Spawn interval + per-fruit weight sliders |

## Gameplay rules

- **Catching** a fruit scores its base points × the current combo multiplier.
- **Combo**: consecutive catches within 2000 ms chain; the multiplier equals the chain
  length, capped at ×5. Going idle past the window, or missing a fruit, resets it.
- **Lives**: a fruit that exits the canvas uncaught costs one of 3 lives. At zero, the
  run ends and your best score is persisted.
- **Fruit mix** (defaults): melon 10 pts / weight 4 · pear 15 pts / weight 3 ·
  pomegranate 25 pts / weight 2 — all tunable in `src/config.ts` or live via settings.

## Architecture

- `src/config.ts` — every tunable: canvas, slicer speed, fruit specs, combo window, lives.
- `src/systems/` — pure logic: `scoring.ts` (combo chains), `spawn.ts` (weighted picker +
  jittered scheduler), `lives.ts`, `storage.ts` (best score + settings persistence).
- `src/entities/fruit.ts` — edge-based spawn positions/velocities and the catch test.
- `src/sketch.ts` — the only p5-aware module: typed instance-mode rendering and input.
- `src/ui/` — DOM HUD and settings panel.

## Tech stack

TypeScript (strict) · Vite · p5.js (typed via @types/p5) · Vitest · ESLint + Prettier · GitHub Actions

## Local development

```bash
npm install
npm run dev        # dev server
npm test           # unit tests
npm run lint       # eslint
npm run build      # typecheck + production build
```

## Testing

- `tests/scoring.test.ts` — chaining, exact window edges, multiplier cap, break/expiry.
- `tests/spawn.test.ts` — weighted distribution over 20k seeded draws, zero/negative
  weights, scheduler interval and jitter bounds, determinism.
- `tests/lives.test.ts` — life-loss rules, game-over boundary, floor at zero.

CI runs lint, tests, and build on every push.

## Deploy

```bash
npm i -g vercel   # once
vercel deploy
```

`vercel.json` is preconfigured for the Vite static build.

## Project history

Started as a 2022 course sketch ("fruit slicer") with globals and bundled p5 libraries.
Rebuilt in 2026: typed modules, combo scoring, lives, live-tunable settings, tests, CI,
and deploy config — original fruit art retained.
