import { Feature, GeoJsonProperties, LineString, Polygon } from "geojson";

export enum OsmType {
  ROAD = "highway",
  BUILDING = "building",
  PARK = "park",
}

export type Point = [number, number];

export type Coordinates = Point[];

export type BuildingGeometry = {
  coordinates: Coordinates;
};

export type RoadGeometry = Feature<LineString, GeoJsonProperties>;
export type PolygonGeometry = Feature<Polygon, GeoJsonProperties>;

export type Geometry = {
  coordinates: Coordinates;
};

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
