/** Life counter with a floor at zero. */
export class Lives {
  private count: number;

  constructor(private readonly start: number) {
    this.count = start;
  }

  get remaining(): number {
    return this.count;
  }

  get gameOver(): boolean {
    return this.count <= 0;
  }

  /** Lose one life; returns true when this loss ended the game. */
  loseOne(): boolean {
    if (this.count > 0) this.count -= 1;
    return this.gameOver;
  }

  reset(): void {
    this.count = this.start;
  }
}
