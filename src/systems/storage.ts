export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const BEST_KEY = 'fruit-rush.best';
const SETTINGS_KEY = 'fruit-rush.settings';

export function safeStorage(): StorageLike {
  try {
    const probe = '__fruit_rush_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => void mem.set(k, v),
    };
  }
}

export function readBest(storage: StorageLike): number {
  const parsed = Number(storage.getItem(BEST_KEY));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function writeBest(storage: StorageLike, score: number): void {
  if (score > readBest(storage)) storage.setItem(BEST_KEY, String(score));
}

export interface StoredSettings {
  spawnIntervalMs: number;
  weights: { melon: number; pear: number; pomegranate: number };
}

export function readSettings(storage: StorageLike, defaults: StoredSettings): StoredSettings {
  const raw = storage.getItem(SETTINGS_KEY);
  if (raw === null) return structuredClone(defaults);
  try {
    const parsed: unknown = JSON.parse(raw);
    const p = parsed as Partial<StoredSettings>;
    return {
      spawnIntervalMs:
        typeof p.spawnIntervalMs === 'number' ? p.spawnIntervalMs : defaults.spawnIntervalMs,
      weights: {
        melon: typeof p.weights?.melon === 'number' ? p.weights.melon : defaults.weights.melon,
        pear: typeof p.weights?.pear === 'number' ? p.weights.pear : defaults.weights.pear,
        pomegranate:
          typeof p.weights?.pomegranate === 'number'
            ? p.weights.pomegranate
            : defaults.weights.pomegranate,
      },
    };
  } catch {
    return structuredClone(defaults);
  }
}

export function writeSettings(storage: StorageLike, settings: StoredSettings): void {
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
