import { CartesianVector } from "./CartesianVector";

/**
 * A vector in the axial hex coordinate system.
 *
 * {@see https://www.redblobgames.com/grids/hexagons/#hex-to-pixel-axial}
 *
 * We are using the "flat top" variant.
 */
export class AxialHexVector {
  public constructor(public readonly q: number, public readonly r: number) {}

  public toCartesian(): CartesianVector {
    return new CartesianVector(
      1.5 * this.q,
      Math.sqrt(3) * (0.5 * this.q + this.r)
    );
  }

  public add(other: AxialHexVector): AxialHexVector {
    return new AxialHexVector(this.q + other.q, this.r + other.r);
  }

  public getNeighbors(): ReadonlyArray<AxialHexVector> {
    return CARDINAL_DIRECTIONS.map((dir) => this.add(dir));
  }

  public toString(): string {
    const prefix = AxialHexVector.stringPrefix;
    return `${prefix}(${this.q},${this.r})`;
  }

  public static fromString(s: string): AxialHexVector {
    const prefix = AxialHexVector.stringPrefix;

    const [q, r] = s
      .slice(prefix.length + 1, -1)
      .split(",")
      .map(Number);
    return new AxialHexVector(q, r);
  }

  private static readonly stringPrefix = "AxialHexVector";
}

// The direction names in the comments assume that positive y points South and positive x points East.
export const CARDINAL_DIRECTIONS: ReadonlyArray<AxialHexVector> = [
  new AxialHexVector(1, 0), // Southeast
  new AxialHexVector(0, 1), // South
  new AxialHexVector(-1, 1), // Southwest
  new AxialHexVector(-1, 0), // Northwest
  new AxialHexVector(0, -1), // North
  new AxialHexVector(1, -1), // Northeast
];
