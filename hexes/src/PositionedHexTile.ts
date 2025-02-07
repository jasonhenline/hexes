import { AxialHexVector } from "./AxialHexCoordinate";
import { HexTile } from "./HexTile";

export class PositionedHexTile {
  public constructor(
    public readonly hexTile: HexTile,
    public position: AxialHexVector,
    public rotation: number,
    public readonly svgGElement: SVGGElement
  ) {}
}
