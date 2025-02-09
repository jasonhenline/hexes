import { HexTile } from "./HexTile";
import { Position } from "./Position";

export class PositionedHexTile {
  public constructor(
    public readonly hexTile: HexTile,
    public position: Position,
    public readonly svgGElement: SVGGElement
  ) {}
}
