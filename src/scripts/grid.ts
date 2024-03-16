export default class Grid<T extends Object> {
  private _gridData: Map<string, T> = new Map<string, T>();

  private key(x: number, y: number): string {
    if (x !== Math.floor(x)) throw new Error("x must be an integer value");
    if (y !== Math.floor(y)) throw new Error("y must be an integer value");
    return `${x}:${y}`;
  }

  public set(x: number, y: number, val: T): void {
    this._gridData.set(this.key(x, y), val);
  }

  public delete(x: number, y: number): void {
    this._gridData.delete(this.key(x, y));
  }

  public get(x: number, y: number): T | undefined {
    return this._gridData.get(this.key(x, y));
  }

  public clear(): void {
    this._gridData = new Map<string, T>();
  }

  public *[Symbol.iterator](): Generator<{ x: number; y: number; val: T }> {
    for (const [key, val] of this._gridData) {
      const [x, y] = key.split(":").map(Number) as [number, number];
      yield { x, y, val };
    }
  }

  public get serialised(): string {
    const cells: { x: number; y: number; val: T }[] = [];
    for (const cell of this) {
      cells.push(cell);
    }
    cells.sort((a, b) => {
      if (a.y !== b.y) return b.y - a.y;
      return b.x - a.x;
    });
    return cells
      .map((cell) => `${cell.x}:${cell.y}:${cell.val.toString()}`)
      .join(";");
  }
}
