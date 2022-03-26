import * as turf from "turf";
import booleanContains from "@turf/boolean-contains";
import { Feature, GeoJsonProperties, Polygon } from "geojson";
import { Cycle, Graph, PathQueue, PolygonWithHeight } from "./types";

const INTERSECTION_AREA_THRESHOLD = 0.0001;

function _stringToPoint(string: string): [number, number] {
  const [lat, lng] = string.split(",");
  return [parseFloat(lat), parseFloat(lng)];
}

function _createSpanningTree(adjacencyGraph: Graph) {
  const spanningTree = new Graph();
  adjacencyGraph.nodes.forEach((node) => {
    let queue: [string, string][] = [];
    const adjacencies = adjacencyGraph.adjacencies.get(node)!;
    adjacencies.forEach((adjacency) => queue.push([node, adjacency]));
    while (queue.length > 0) {
      const [nodeA, nodeB] = queue.shift()!;
      if (
        !spanningTree.nodes.includes(nodeA) ||
        !spanningTree.nodes.includes(nodeB)
      ) {
        spanningTree.addEdge([nodeA, nodeB]);
        const nodeBAdjacencies = adjacencyGraph.adjacencies.get(nodeB);
        nodeBAdjacencies!.forEach((adjancency) =>
          queue.push([nodeB, adjancency])
        );
      }
    }
  });
  return spanningTree;
}

function _findCycleFromEdge(
  [nodeA, nodeB]: [string, string],
  adjacencyGraph: Graph
): Graph {
  const paths: Map<string, string[]> = new Map();
  let cycleGraph = new Graph();

  let queue: PathQueue[] = [];
  const nodeAAdjacencies = adjacencyGraph.adjacencies.get(nodeA);
  const nodeBAdjacencies = adjacencyGraph.adjacencies.get(nodeB);
  nodeAAdjacencies!.forEach((adjacency) => {
    queue.push({ path: [nodeA, adjacency] });
  });
  nodeBAdjacencies!.forEach((adjacency) => {
    queue.push({ path: [nodeB, adjacency] });
  });

  while (queue.length > 0) {
    const { path } = queue.shift()!;
    const latestNode = path[path.length - 1];

    if (paths.has(latestNode)) {
      const mergedPathReversed = paths.get(latestNode)!.reverse();
      const pathsMerged = [...path, ...mergedPathReversed.slice(1)];
      const cycle =
        path[0] === nodeA ? [nodeB, ...pathsMerged] : [nodeA, ...pathsMerged];
      cycle.forEach((node, index) => {
        if (index !== cycle.length - 1) {
          cycleGraph.addEdge([node, cycle[index + 1]]);
        }
      });
      break;
    }

    if (latestNode !== nodeA && latestNode !== nodeB) {
      paths.set(latestNode, path);
      adjacencyGraph.adjacencies.get(latestNode)!.forEach((adjancency) => {
        if (!path.includes(adjancency)) {
          queue.push({ path: [...path, adjancency] });
        }
      });
    }
  }
  return cycleGraph;
}

function _mergeCycles(initialCycles: Graph[]) {
  let allCycles = [...initialCycles];
  for (let indexA = 0; indexA < initialCycles.length; indexA += 1) {
    let newCycles = [];
    for (let indexB = indexA + 1; indexB < allCycles.length; indexB += 1) {
      let newCycle = new Graph();

      const cycleAEdges = initialCycles[indexA].edges;
      const cycleBEdges = allCycles[indexB].edges;

      const cycleAEdgesLookup = new Set(initialCycles[indexA].edgesLookup);
      const cycleBEdgesLookup = new Set(allCycles[indexB].edgesLookup);

      let newEdges: [string, string][] = [];
      cycleAEdges.forEach((edge) => {
        if (
          !cycleBEdgesLookup.has(edge.toString()) &&
          !cycleBEdgesLookup.has([edge[1], edge[0]].toString())
        ) {
          newEdges.push(edge);
        }
      });
      cycleBEdges.forEach((edge) => {
        if (
          !cycleAEdgesLookup.has(edge.toString()) &&
          !cycleAEdgesLookup.has([edge[1], edge[0]].toString())
        ) {
          newEdges.push(edge);
        }
      });
      newEdges.forEach((edge) => newCycle.addEdge(edge));
      newCycles.push(newCycle);
    }
    allCycles = [...allCycles, ...newCycles];
  }
  return allCycles;
}

function _makeValidCycle(graph: Graph): Cycle | undefined {
  if (graph.nodes.length <= 2) return;
  const srcNode = graph.nodes[0];
  let dstNode = graph.adjacencies.get(srcNode)![0];
  let path = [srcNode, dstNode];
  while (dstNode !== srcNode) {
    const adjacencies = graph.adjacencies.get(dstNode)!;
    if (adjacencies.length === 1) return;
    if (adjacencies.length > 2) {
      return;
    }
    dstNode =
      path[path.length - 2] !== adjacencies[0]
        ? adjacencies[0]
        : adjacencies[1];
    path.push(dstNode);
  }
  const cycle = path.map((node) => _stringToPoint(node));
  return cycle;
}

export function findCycles(adjacencyGraph: Graph) {
  const spanningTree = _createSpanningTree(adjacencyGraph);
  const nonOverlappingEdges = adjacencyGraph.edges.filter(
    (edge) =>
      !spanningTree.edgesLookup.includes(edge.toString()) &&
      !spanningTree.edgesLookup.includes([edge[1], edge[0]].toString())
  );

  const initialCycles: Graph[] = nonOverlappingEdges
    .map((edge) => _findCycleFromEdge(edge, spanningTree))
    .filter((cycle) => cycle.nodes.length > 0);
  const combinedCycles = _mergeCycles(initialCycles);

  try {
    const validCycles = combinedCycles
      .map((cycle) => _makeValidCycle(cycle))
      .filter((cycle) => cycle !== undefined) as Cycle[];
    return validCycles;
  } catch {
    debugger;
    throw new Error("na");
  }
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

  let uniqueCycleStrings = new Set<string>();
  let uniqueIndices = [];
  for (let index = 0; index < sortedCycles.length; index += 1) {
    const cycleString = cycles[index].toString();
    if (!uniqueCycleStrings.has(cycleString)) {
      uniqueIndices.push(index);
      uniqueCycleStrings.add(cycleString);
    }
  }
  let uniqueCycles: Cycle[] = uniqueIndices.map((index) => cycles[index]);
  return uniqueCycles;
}

export function removeOverlappingCycles(
  cycles: Cycle[]
): Feature<Polygon, GeoJsonProperties>[] {
  const polygons = cycles.map((cycle) => turf.polygon([[...cycle, cycle[0]]]));
  let removableIndices = [];
  for (let startIndex = 0; startIndex < polygons.length; startIndex += 1) {
    const polygonStartArea = turf.area(polygons[startIndex]);
    for (let endIndex = 0; endIndex < polygons.length; endIndex += 1) {
      if (startIndex === endIndex) continue;
      const polygonIntersection = turf.intersect(
        polygons[startIndex],
        polygons[endIndex]
      );
      if (polygonIntersection) {
        const polygonIntersectionArea = turf.area(polygonIntersection);
        if (
          polygonIntersectionArea > 0 &&
          Math.abs(polygonStartArea - polygonIntersectionArea) >
            INTERSECTION_AREA_THRESHOLD
        ) {
          removableIndices.push(startIndex);
          break;
        }
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
