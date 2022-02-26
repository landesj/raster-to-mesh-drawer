import * as turf from "turf";
import booleanContains from "@turf/boolean-contains";
import { Feature, GeoJsonProperties, Polygon } from "geojson";

type Cycle = [number, number][];
type PolygonWithHeight = {
  polygon: Feature<Polygon, GeoJsonProperties>;
  height: number;
};

function _pointsEqual(
  pointA: [number, number],
  pointB: [number, number]
): boolean {
  return pointA[0] === pointB[0] && pointA[1] === pointB[1];
}

function _stringToPoint(string: string): [number, number] {
  const [lat, lng] = string.split(",");
  return [parseFloat(lat), parseFloat(lng)];
}

// Test these functions
export function findCycles(adjacencies: Map<string, [number, number][]>) {
  let cycles: Cycle[] = [];
  adjacencies.forEach((dstPoints, currentPointString) => {
    const currentPoint = _stringToPoint(currentPointString);
    dstPoints.forEach((dstPoint) => {
      let visitedPoints = new Set<string>();
      visitedPoints.add(currentPointString);
      let queue = [{ points: [currentPoint, dstPoint], depth: 1 }];
      while (queue.length > 0) {
        const { points, depth } = queue[0];
        const queuePoint = points[points.length - 1];
        visitedPoints.add(queuePoint.toString());
        queue = queue.slice(1);
        let queueAdjacencies = adjacencies.get(queuePoint.toString());
        if (queueAdjacencies) {
          queueAdjacencies.forEach((adjacentPoint) => {
            if (_pointsEqual(currentPoint, adjacentPoint) && depth !== 1) {
              cycles.push([...points]);
            } else if (!visitedPoints.has(adjacentPoint.toString())) {
              queue.push({
                points: [...points, adjacentPoint],
                depth: depth + 1,
              });
            }
          });
        }
      }
    });
  });
  return cycles;
}

function _sortPoints(
  pointA: [number, number],
  pointB: [number, number]
): number {
  if (pointA[0] < pointB[0]) return -1;
  else if (pointA[0] === pointB[0]) return pointA[1] < pointB[1] ? -1 : 1;
  else return 1;
}

export function filterDuplicateCycles(cycles: Cycle[]): Cycle[] {
  const cyclesDuplicated = [...cycles];
  const sortedCycles = cyclesDuplicated.map((cycle) =>
    [...cycle].sort((a, b) => _sortPoints(a, b))
  );
  let removableIndices = [];
  for (
    let startIndex = 0;
    startIndex < sortedCycles.length - 1;
    startIndex += 1
  ) {
    for (
      let endIndex = startIndex + 1;
      endIndex < sortedCycles.length;
      endIndex += 1
    ) {
      if (
        sortedCycles[startIndex].toString() ===
        sortedCycles[endIndex].toString()
      ) {
        removableIndices.push(endIndex);
      }
    }
  }
  let uniqueCycles: Cycle[] = [];
  for (let index = 0; index < sortedCycles.length; index += 1) {
    if (!removableIndices.includes(index)) {
      uniqueCycles.push(cycles[index]);
    }
  }
  return uniqueCycles;
}

export function removeOverlappingCycles(
  cycles: Cycle[]
): Feature<Polygon, GeoJsonProperties>[] {
  const polygons = cycles.map((cycle) => turf.polygon([[...cycle, cycle[0]]]));
  let removableIndices = [];
  for (let startIndex = 0; startIndex < polygons.length; startIndex += 1) {
    for (let endIndex = 0; endIndex < polygons.length; endIndex += 1) {
      if (startIndex === endIndex) continue;
      if (booleanContains(polygons[startIndex], polygons[endIndex])) {
        removableIndices.push(startIndex);
      }
    }
  }
  let finalPolygons = [];
  for (let index = 0; index < polygons.length; index += 1) {
    if (!removableIndices.includes(index)) {
      finalPolygons.push(polygons[index]);
    }
  }
  return finalPolygons;
}

function _getPolygonBounds(polygon: Feature<Polygon, GeoJsonProperties>) {
  const yMin = polygon.geometry.coordinates[0].reduce(
    (currentMin, coord2) => Math.min(currentMin, coord2[0]),
    Infinity
  );
  const yMax = polygon.geometry.coordinates[0].reduce(
    (currentMin, coord2) => Math.max(currentMin, coord2[0]),
    -Infinity
  );
  const xMin = polygon.geometry.coordinates[0].reduce(
    (currentMin, coord2) => Math.min(currentMin, coord2[1]),
    Infinity
  );
  const xMax = polygon.geometry.coordinates[0].reduce(
    (currentMin, coord2) => Math.max(currentMin, coord2[1]),
    -Infinity
  );
  return [
    [xMin, yMin],
    [xMax, yMax],
  ];
}

function _getPolygonHeight(
  polygon: Feature<Polygon, GeoJsonProperties>,
  georaster: any
): number {
  let totalHeight = 0;
  let totalPixels = 0;
  const [[xMin, yMin], [xMax, yMax]] = _getPolygonBounds(polygon);
  for (let x = xMin; x <= xMax; x += georaster.pixelWidth) {
    for (let y = yMin; y <= yMax; y += georaster.pixelHeight) {
      const newPoint = turf.point([y, x]);
      if (booleanContains(polygon, newPoint)) {
        const xPixelIndex = Math.round(
          (x - georaster.xmin) / georaster.pixelWidth
        );
        const yPixelIndex = Math.round(
          (georaster.ymax - y) / georaster.pixelHeight
        );
        const pixelValue = georaster.values[0][yPixelIndex][xPixelIndex];
        if (pixelValue !== georaster.noDataValue) {
          totalHeight += pixelValue;
          totalPixels += 1;
        }
      }
    }
  }
  return totalHeight / totalPixels;
}

export function fetchHeightFromRaster(
  polygons: Feature<Polygon, GeoJsonProperties>[],
  georaster: any
): PolygonWithHeight[] {
  const polygonsWithHeight = polygons.map((polygon) => {
    const polygonHeight = _getPolygonHeight(polygon, georaster);
    return {
      polygon: polygon,
      height: polygonHeight,
    };
  });
  return polygonsWithHeight;
}
