export enum OsmType {
  ROAD = "highway",
  BUILDING = "building",
  PARK = "park",
}

export type OsmNode = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
};

export type RoadTags = {
  highway: string;
};

export type OsmWay = {
  type: "way";
  id: number;
  nodes: number[];
  tags: RoadTags;
};

export type OsmElement = OsmWay | OsmNode;

export type OSMResponse = {
  version: number;
  generator: string;
  osm3s: { timestamp_osm_base: string; copyright: string };
  elements: OsmElement[];
  remark?: string;
};

export class OsmFetchError extends Error {}
