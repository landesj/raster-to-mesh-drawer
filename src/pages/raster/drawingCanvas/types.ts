import { LineType } from "../../../assets/Line";
import { PointType } from "../../../assets/Point";
import { Feature, GeoJsonProperties, Polygon } from "geojson";

export type TurfPolygon = Feature<Polygon, GeoJsonProperties>;

export type Cycle = [number, number][];

export type PolygonWithHeight = {
  polygon: TurfPolygon;
  height: number;
};

export type PathQueue = { path: string[] };

export type DrawingPointAction = {
  geometryType: "point";
  geometry: PointType;
};

export type DrawingLineAction = {
  geometryType: "line";
  geometry: LineType;
};

export type ActionType = "add" | "remove";

export type GeometryType = "point" | "line";

export type DrawingAction = {
  actionType: ActionType;
  action: DrawingPointAction | DrawingLineAction;
};

export type HistoryState = {
  actions: DrawingAction[];
  latestPoint: PointType | undefined;
};

export type SnapEvent = {
  type: GeometryType;
  snappingPoint?: PointType;
  newLines?: LineType[];
  removedLine?: LineType;
};

export class Graph {
  nodes: string[];
  edges: [string, string][];
  edgesLookup: string[];
  adjacencies: Map<string, string[]>;

  constructor() {
    this.nodes = [];
    this.edges = [];
    this.edgesLookup = [];
    this.adjacencies = new Map<string, string[]>();
  }

  addNode(node: string) {
    if (!this.nodes.includes(node)) {
      this.nodes.push(node);
    }
  }

  addEdge(edge: [string, string]) {
    const [srcNode, dstNode] = edge;
    this.addNode(srcNode);
    this.addNode(dstNode);
    if (
      !this.edgesLookup.includes(edge.toString()) &&
      !this.edgesLookup.includes([dstNode, srcNode].toString())
    ) {
      this.edges.push(edge);
      this.edgesLookup.push(edge.toString());

      const srcNodeAdjacencies = this.adjacencies.get(srcNode);
      const dstNodeAdjacencies = this.adjacencies.get(dstNode);

      if (srcNodeAdjacencies) {
        srcNodeAdjacencies.push(dstNode);
        this.adjacencies.set(srcNode, srcNodeAdjacencies);
      } else {
        this.adjacencies.set(srcNode, [dstNode]);
      }

      if (dstNodeAdjacencies) {
        dstNodeAdjacencies.push(srcNode);
        this.adjacencies.set(dstNode, dstNodeAdjacencies);
      } else {
        this.adjacencies.set(dstNode, [srcNode]);
      }
    }
  }

  createGraphFromListOfLines(lines: LineType[]) {
    lines.forEach((line: LineType) => {
      const srcNode = [line.latSrc, line.lngSrc].toString();
      const dstNode = [line.latDst, line.lngDst].toString();
      if (!this.nodes.includes(srcNode)) {
        this.nodes.push(srcNode);
      }
      if (!this.nodes.includes(dstNode)) {
        this.nodes.push(dstNode);
      }

      const newEdge: [string, string] = [srcNode, dstNode];
      this.edges.push(newEdge);
      this.edgesLookup.push(newEdge.toString());

      const srcNodeAdjacencies = this.adjacencies.get(srcNode);
      const dstNodeAdjacencies = this.adjacencies.get(dstNode);

      if (srcNodeAdjacencies) {
        srcNodeAdjacencies.push(dstNode);
        this.adjacencies.set(srcNode, srcNodeAdjacencies);
      } else {
        this.adjacencies.set(srcNode, [dstNode]);
      }

      if (dstNodeAdjacencies) {
        dstNodeAdjacencies.push(srcNode);
        this.adjacencies.set(dstNode, dstNodeAdjacencies);
      } else {
        this.adjacencies.set(dstNode, [srcNode]);
      }
    });
  }
}
