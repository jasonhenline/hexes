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
          const neededEdge =
            (reverseEdge - neighborTile.position.rotation + 6) % 6;
          if (
            neighborTile.hexTile.connectableEdgeIndexes.includes(neededEdge)
          ) {
            result.push(i);
            break;
          }
        }
      }
    }
    return result;
  }

  function createNewCurrentTile(
    allowedPositionTiles: PositionedHexTile[]
  ): PositionedHexTile {
    const hexTile = createRandomHexTile();
    const element = renderer.createElementForHexTile(hexTile);
    element.classList.add("current");
    const location = allowedPositionTiles[0].position.location;
    const positionedTile = new PositionedHexTile(
      hexTile,
      {
        location,
        rotation: getAllowedRotations(location, hexTile)[0],
      },
      element
    );
    renderer.setTransformAttribute(positionedTile);

    element.addEventListener("click", () => {
      const allowedRotations = getAllowedRotations(
        positionedTile.position.location,
        hexTile
      );
      if (allowedRotations.length === 0) {
        return;
      }
      const currentRotationIndex = allowedRotations.indexOf(
        positionedTile.position.rotation
      );
      const newRotationIndex =
        (currentRotationIndex + 1) % allowedRotations.length;

      const newPosition = {
        location: positionedTile.position.location,
        rotation: allowedRotations[newRotationIndex],
      };

      renderer.animateToPosition(positionedTile, newPosition);
    });

    svgElement.appendChild(element);
    return positionedTile;
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

  currentTile = createNewCurrentTile(allowedPositionTiles);

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

    currentTile = createNewCurrentTile(allowedPositionTiles);
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
