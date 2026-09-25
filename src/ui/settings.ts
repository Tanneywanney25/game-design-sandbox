import { FRUIT_TYPES, type FruitType } from '../config';
import type { StoredSettings } from '../systems/storage';

/** Settings panel: spawn interval plus one weight slider per fruit type. */
export function buildSettingsPanel(
  panel: HTMLElement,
  toggleButton: HTMLElement,
  settings: StoredSettings,
  onChange: (settings: StoredSettings) => void,
): void {
  panel.innerHTML = '';

  const addSlider = (
    labelText: string,
    min: number,
    max: number,
    step: number,
    value: number,
    apply: (v: number) => void,
  ): void => {
    const label = document.createElement('label');
    const readout = document.createElement('strong');
    readout.textContent = ` ${value}`;
    label.append(`${labelText}:`, readout);
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener('input', () => {
      const v = Number(input.value);
      readout.textContent = ` ${v}`;
      apply(v);
      onChange(settings);
    });
    label.append(input);
    panel.append(label);
  };

  addSlider('Spawn interval (ms)', 400, 2000, 50, settings.spawnIntervalMs, (v) => {
    settings.spawnIntervalMs = v;
  });

  const names: Record<FruitType, string> = {
    melon: 'Melon weight',
    pear: 'Pear weight',
    pomegranate: 'Pomegranate weight',
  };
  for (const type of FRUIT_TYPES) {
    addSlider(names[type], 0, 10, 1, settings.weights[type], (v) => {
      settings.weights[type] = v;
    });
  }

  toggleButton.addEventListener('click', () => {
    const nowHidden = !panel.hidden;
    panel.hidden = nowHidden;
    toggleButton.setAttribute('aria-expanded', String(!nowHidden));
  });
}
