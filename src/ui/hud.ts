/** DOM HUD: score, combo, lives, best. */
export class Hud {
  private readonly scoreEl: HTMLElement;
  private readonly comboEl: HTMLElement;
  private readonly livesEl: HTMLElement;
  private readonly bestEl: HTMLElement;

  constructor() {
    this.scoreEl = Hud.require('#hud-score');
    this.comboEl = Hud.require('#hud-combo');
    this.livesEl = Hud.require('#hud-lives');
    this.bestEl = Hud.require('#hud-best');
  }

  private static require(selector: string): HTMLElement {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) throw new Error(`Missing HUD element ${selector}`);
    return el;
  }

  update(score: number, combo: number, multiplier: number, lives: number, maxLives: number, best: number): void {
    this.scoreEl.textContent = `Score: ${score}`;
    this.comboEl.textContent = combo > 1 ? `Combo ×${multiplier} (${combo})` : 'Combo: —';
    this.livesEl.textContent = '♥'.repeat(lives) + '♡'.repeat(Math.max(0, maxLives - lives));
    this.bestEl.textContent = `Best: ${best}`;
  }
}
