import { describe, expect, it } from 'vitest';
import { Lives } from '../src/systems/lives';

describe('Lives', () => {
  it('starts with the configured count and no game over', () => {
    const lives = new Lives(3);
    expect(lives.remaining).toBe(3);
    expect(lives.gameOver).toBe(false);
  });

  it('each miss removes exactly one life', () => {
    const lives = new Lives(3);
    lives.loseOne();
    expect(lives.remaining).toBe(2);
    lives.loseOne();
    expect(lives.remaining).toBe(1);
    expect(lives.gameOver).toBe(false);
  });

  it('reports game over exactly when the last life is lost', () => {
    const lives = new Lives(2);
    expect(lives.loseOne()).toBe(false);
    expect(lives.loseOne()).toBe(true);
    expect(lives.gameOver).toBe(true);
  });

  it('never goes below zero', () => {
    const lives = new Lives(1);
    lives.loseOne();
    lives.loseOne();
    lives.loseOne();
    expect(lives.remaining).toBe(0);
  });

  it('reset restores the starting count', () => {
    const lives = new Lives(3);
    lives.loseOne();
    lives.loseOne();
    lives.reset();
    expect(lives.remaining).toBe(3);
    expect(lives.gameOver).toBe(false);
  });
});
