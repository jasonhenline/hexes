import { AxialHexVector, CARDINAL_DIRECTIONS } from "./AxialHexCoordinate";
import { HexTile } from "./HexTile";
import { PositionedHexTile } from "./PositionedHexTile";
import { Renderer } from "./Renderer";

export function runGame(
  svgElement: SVGElement,
  placeHexButton: HTMLButtonElement
): void {
  const renderer = new Renderer(svgElement);
  const startingHexTile: HexTile = new HexTile([0, 1, 2, 3, 4, 5]);
  const renderedStartingHexTile =
    renderer.createElementForHexTile(startingHexTile);
  renderedStartingHexTile.classList.add("placed");
  svgElement.appendChild(renderedStartingHexTile);

  const keyToPlacedHexTile: Map<string, PositionedHexTile> = new Map([
    [
      new AxialHexVector(0, 0).toString(),
      new PositionedHexTile(
        startingHexTile,
        {
          location: new AxialHexVector(0, 0),
          rotation: 0,
        },
        renderedStartingHexTile
      ),
    ],
  ]);

  let currentTile: PositionedHexTile | undefined;

  function getAllowedRotations(
    location: AxialHexVector,
    hexTile: HexTile
  ): number[] {
    const result: number[] = [];
    for (let i = 0; i < 6; i++) {
      for (const baseEdge of hexTile.connectableEdgeIndexes) {
        const edge = (baseEdge + i) % 6;
        const reverseEdge = (edge + 3) % 6;
        const neighborLocationKey = location
          .add(CARDINAL_DIRECTIONS[edge])
          .toString();
        const neighborTile = keyToPlacedHexTile.get(neighborLocationKey);
        if (neighborTile !== undefined) {
          if (
            neighborTile.hexTile.connectableEdgeIndexes.includes(reverseEdge)
          ) {
            result.push(i);
            break;
          }
        }
      }
    }
    return result;
  }

  function createAllowedPositionTiles(): PositionedHexTile[] {
    const occupiedKeySet: Set<string> = new Set(keyToPlacedHexTile.keys());
    const allowedPositionTiles: PositionedHexTile[] = [];
    for (const placedHexTile of keyToPlacedHexTile.values()) {
      for (const baselineEdgeIndex of placedHexTile.hexTile
        .connectableEdgeIndexes) {
        const edgeIndex =
          (baselineEdgeIndex + placedHexTile.position.rotation) % 6;
        const neighborPosition = placedHexTile.position.location.add(
          CARDINAL_DIRECTIONS[edgeIndex]
        );
        const neighborPositionKey = neighborPosition.toString();
        if (!occupiedKeySet.has(neighborPositionKey)) {
          occupiedKeySet.add(neighborPositionKey);
          const allowedPositionHexTile = new HexTile([]);
          const renderedAllowedPositionHexTile =
            renderer.createElementForHexTile(allowedPositionHexTile);
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
            const newLocation = allowedPositionTile.position.location;
            const newPosition = {
              location: newLocation,
              rotation: getAllowedRotations(
                newLocation,
                currentTile.hexTile
              )[0],
            };
            renderer.animateToPosition(currentTile, newPosition);
          });
        }
      }
    }
    return allowedPositionTiles;
  }

  let allowedPositionTiles = createAllowedPositionTiles();

  // Add the current tile.
  const currentHexTile = createRandomHexTile();
  const currentElement = renderer.createElementForHexTile(currentHexTile);
  currentElement.classList.add("current");
  const location = allowedPositionTiles[0].position.location;
  currentTile = new PositionedHexTile(
    currentHexTile,
    {
      location,
      rotation: getAllowedRotations(location, currentHexTile)[0],
    },
    currentElement
  );
  renderer.setTransformAttribute(currentTile);
  svgElement.appendChild(currentElement);

  placeHexButton.addEventListener("click", () => {
    if (currentTile === undefined) {
      return;
    }
    currentTile.svgGElement.classList.remove("current");
    currentTile.svgGElement.classList.add("placed");
    keyToPlacedHexTile.set(
      currentTile.position.location.toString(),
      currentTile
    );
    allowedPositionTiles.forEach((tile) => {
      tile.svgGElement.remove();
    });
    allowedPositionTiles = createAllowedPositionTiles();

    const currentHexTile = createRandomHexTile();
    const currentElement = renderer.createElementForHexTile(currentHexTile);
    currentElement.classList.add("current");
    const location = allowedPositionTiles[0].position.location;
    currentTile = new PositionedHexTile(
      currentHexTile,
      {
        location,
        rotation: getAllowedRotations(location, currentHexTile)[0],
      },
      currentElement
    );
    renderer.setTransformAttribute(currentTile);
    svgElement.appendChild(currentElement);
  });
}

function createRandomHexTile(): HexTile {
  const edges = [0];
  for (let i = 1; i < 6; i++) {
    if (Math.random() < 0.5) {
      edges.push(i);
    }
  }
  return new HexTile(edges);
}
