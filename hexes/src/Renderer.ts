import { Animation } from "./Animation";
import { HexTile } from "./HexTile";
import { Position } from "./Position";
import { PositionedHexTile } from "./PositionedHexTile";

export class Renderer {
  public constructor(
    private readonly svgElement: SVGElement,
    private readonly hexSize = 40
  ) {
    svgElement.setAttribute("width", "800");
    svgElement.setAttribute("height", "600");
    svgElement.setAttribute("viewBox", "-400 -300 800 600");
  }

  public createElementForHexTile(hexTile: HexTile): SVGGElement {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = 0.95 * this.hexSize * Math.cos(angle);
      const y = 0.95 * this.hexSize * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    const polygonElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    polygonElement.setAttribute("points", points.join(" "));

    const groupElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    groupElement.appendChild(polygonElement);

    for (const edgeIndex of hexTile.connectableEdgeIndexes) {
      const markerElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      const angle = Math.PI / 6 + (Math.PI / 3) * edgeIndex;
      const radius = this.hexSize * 0.7;
      markerElement.setAttribute("r", (this.hexSize / 10).toString());
      markerElement.setAttribute("cx", (radius * Math.cos(angle)).toString());
      markerElement.setAttribute("cy", (radius * Math.sin(angle)).toString());
      markerElement.classList.add("marker");
      groupElement.appendChild(markerElement);
    }

    return groupElement;
  }

  public getTransformString(position: Position): string {
    const rotationDegrees = position.rotation * 60;
    const cartesianPosition = position.location.toCartesian();
    const x = cartesianPosition.x * this.hexSize;
    const y = cartesianPosition.y * this.hexSize;
    return `translate(${x}, ${y}) rotate(${rotationDegrees})`;
  }

  public setTransformAttribute(tile: PositionedHexTile): void {
    tile.svgGElement.setAttribute(
      "transform",
      this.getTransformString(tile.position)
    );
  }

  public animateToPosition(
    tile: PositionedHexTile,
    newPosition: Position
  ): void {
    if (this.animation !== undefined) {
      return;
    }
    const startTime = performance.now();
    const endTime = startTime + 1000;
    this.animation = {
      startTime,
      endTime,
      startPosition: tile.position,
      endPosition: newPosition,
      svgGElement: tile.svgGElement,
    };

    tile.position = newPosition;

    requestAnimationFrame(() => this.updateAnimation());
  }

  private updateAnimation(): void {
    if (this.animation === undefined) {
      return;
    }
    const now = performance.now();
    if (now >= this.animation.endTime) {
      this.animation.svgGElement.setAttribute(
        "transform",
        this.getTransformString(this.animation.endPosition)
      );
      this.animation = undefined;
      return;
    }
    const duration = this.animation.endTime - this.animation.startTime;
    const progress = (now - this.animation.startTime) / duration;

    const rotation =
      this.animation.startPosition.rotation +
      progress *
        (this.animation.endPosition.rotation -
          this.animation.startPosition.rotation);

    const endCartesian = this.animation.endPosition.location.toCartesian();
    const startCartesian = this.animation.startPosition.location.toCartesian();
    const x = startCartesian.x + progress * (endCartesian.x - startCartesian.x);
    const y = startCartesian.y + progress * (endCartesian.y - startCartesian.y);
    const scaledX = x * this.hexSize;
    const scaledY = y * this.hexSize;

    const scale = 1 + 0.2 * Math.sin(progress * Math.PI);

    this.animation.svgGElement.setAttribute(
      "transform",
      `translate(${scaledX}, ${scaledY}) rotate(${
        rotation * 60
      }) scale(${scale})`
    );

    requestAnimationFrame(() => this.updateAnimation());
  }

  private animation: Animation | undefined;
}
