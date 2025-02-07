export class HexTile {
  public constructor(
    public readonly connectableEdgeIndexes: ReadonlyArray<number> = []
  ) {}
}
