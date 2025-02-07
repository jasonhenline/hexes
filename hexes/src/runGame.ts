import { AxialHexVector, CARDINAL_DIRECTIONS } from "./AxialHexCoordinate";
import { HexTile } from "./HexTile";
import { PositionedHexTile } from "./PositionedHexTile";
import { Renderer } from "./Renderer";

export function runGame(svgElement: SVGElement): void {
  const renderer = new Renderer(svgElement);
  const startingHexTile: HexTile = new HexTile([0, 1, 2, 3, 4, 5]);
  const renderedStartingHexTile =
    renderer.createElementForHexTile(startingHexTile);
  renderedStartingHexTile.classList.add("placed");
  svgElement.appendChild(renderedStartingHexTile);

  const placedHexTiles: PositionedHexTile[] = [
    new PositionedHexTile(
      startingHexTile,
      {
        location: new AxialHexVector(0, 0),
        rotation: 0,
      },
      renderedStartingHexTile
    ),
  ];

  let currentTile: PositionedHexTile | undefined;

  // Find all the places it can go and make temporary hexes for those.
  const allowedPositionKeySet: Set<string> = new Set();
  const allowedPositionTiles: PositionedHexTile[] = [];
  for (const placedHexTile of placedHexTiles) {
    for (const baselineEdgeIndex of placedHexTile.hexTile
      .connectableEdgeIndexes) {
      const edgeIndex =
        (baselineEdgeIndex + placedHexTile.position.rotation) % 6;
      const neighborPosition = placedHexTile.position.location.add(
        CARDINAL_DIRECTIONS[edgeIndex]
      );
      const neighborPositionKey = neighborPosition.toString();
      if (!allowedPositionKeySet.has(neighborPositionKey)) {
        allowedPositionKeySet.add(neighborPositionKey);
        const allowedPositionHexTile = new HexTile([]);
        const renderedAllowedPositionHexTile = renderer.createElementForHexTile(
          allowedPositionHexTile
        );
        renderedAllowedPositionHexTile.classList.add("allowed-position");
        const allowedPositionTile = new PositionedHexTile(
          allowedPositionHexTile,
          { location: neighborPosition, rotation: 0 },
          renderedAllowedPositionHexTile
        );
        renderer.setTransformAttribute(allowedPositionTile);
        allowedPositionTiles.push(allowedPositionTile);
        svgElement.appendChild(allowedPositionTile.svgGElement);

        allowedPositionTile.svgGElement.addEventListener("click", () => {
          if (currentTile === undefined) {
            return;
          }
          const newPosition = {
            location: allowedPositionTile.position.location,
            rotation: Math.floor(Math.random() * 6),
          };
          renderer.animateToPosition(currentTile, newPosition);
        });
      }
    }
  }

  // Add the current tile.
  const currentHexTile = new HexTile([0, 2]);
  const currentElement = renderer.createElementForHexTile(currentHexTile);
  currentElement.classList.add("current");
  currentTile = new PositionedHexTile(
    currentHexTile,
    {
      location: allowedPositionTiles[0].position.location,
      rotation: 0,
    },
    currentElement
  );
  renderer.setTransformAttribute(currentTile);
  svgElement.appendChild(currentElement);
}
