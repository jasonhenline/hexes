import { Position } from "./Position";

export type Animation = {
  readonly startTime: number;
  readonly endTime: number;
  readonly startPosition: Position;
  readonly endPosition: Position;
  readonly svgGElement: SVGGElement;
};
