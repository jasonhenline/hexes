import { AxialHexVector } from "./AxialHexCoordinate";

export type Position = {
  readonly location: AxialHexVector;
  readonly rotation: number;
};
