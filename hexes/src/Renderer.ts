import { AxialHexVector } from "./AxialHexCoordinate";
import { HexTile } from "./HexTile";
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

  public getTransformString(
    tile: PositionedHexTile,
    withPx: boolean = false
  ): string {
    const rotation = tile.rotation * 60;
    const cartesianPosition = tile.position.toCartesian();
    const x = cartesianPosition.x * this.hexSize;
    const y = cartesianPosition.y * this.hexSize;
    const px = withPx ? "px" : "";

    return `translate(${x}${px}, ${y}${px})`;
  }

  public setTransformAttribute(tile: PositionedHexTile): void {
    tile.svgGElement.setAttribute("transform", this.getTransformString(tile));
  }

  public animateToNewPosition(
    tile: PositionedHexTile,
    newPosition: AxialHexVector,
    newRotation: number
  ): void {
    const oldTransform = this.getTransformString(tile, true);
    tile.position = newPosition;
    tile.rotation = newRotation;
    const newTransform = this.getTransformString(tile, true);
    tile.svgGElement.animate(
      [{ transform: oldTransform }, { transform: newTransform }],
      {
        duration: 500,
        easing: "ease-out",
        fill: "forwards",
      }
    );
  }

  public animateToNewTransformAttribute(tile: PositionedHexTile): void {
    const oldTransform =
      tile.svgGElement.getAttribute("transform") || "translate(0, 0)";
    const newTransform = this.getTransformString(tile, true);

    console.log("Old Transform:", oldTransform);
    console.log("New Transform:", newTransform);

    tile.svgGElement.animate(
      [{ transform: oldTransform }, { transform: newTransform }],
      {
        duration: 500,
        easing: "ease-out",
        fill: "forwards",
      }
    );
  }
}
