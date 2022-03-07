import { LatLngBounds } from "leaflet";

const HIGHWAY_WHITELIST = [
  "residential",
  "primary",
  "secondary",
  "tertiary",
  "trunk",
  "motorway",
];

type Point = [number, number];

type Coordinates = Point[];

export type BuildingGeometry = {
  coordinates: Coordinates;
  height: number | undefined;
};

export type RoadGeometry = {
  coordinates: Coordinates;
};

type OsmNode = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
};

type RoadTags = {
  highway: string;
};

type OsmWay = {
  type: "way";
  id: number;
  nodes: number[];
  tags: RoadTags;
};

type OsmElement = OsmWay | OsmNode;

type OSMResponse = {
  version: number;
  generator: string;
  osm3s: { timestamp_osm_base: string; copyright: string };
  elements: OsmElement[];
};

function getBuildingGeometry(
  element: OsmElement,
  nodeIdToLatLon: Map<number, [number, number]>
) {
  let coordinates: Coordinates = [];
  let height;
  if (element.type === "way") {
    element.nodes.forEach((value) => {
      const latLon = nodeIdToLatLon.get(value);
      if (latLon !== undefined) {
        coordinates.push(latLon);
      }
    });
    height = 15;
  }
  return {
    coordinates: coordinates,
    height: height,
  };
}

function getRoadGeometry(
  element: OsmElement,
  nodeIdToLatLon: Map<number, [number, number]>
) {
  let coordinates: Coordinates = [];
  if (element.type === "way") {
    if (
      element.tags.highway !== undefined &&
      HIGHWAY_WHITELIST.includes(element.tags.highway)
    ) {
      element.nodes.forEach((value) => {
        const latLon = nodeIdToLatLon.get(value);
        if (latLon !== undefined) {
          coordinates.push(latLon);
        }
      });
    }
  }
  return {
    coordinates: coordinates,
  };
}

async function fetchDataFromOsm(dataType: string, bounds: LatLngBounds) {
  const latMax = bounds.getNorthEast().lat;
  const latMin = bounds.getSouthWest().lat;
  const lonMin = bounds.getSouthWest().lng;
  const lonMax = bounds.getNorthEast().lng;
  const requestUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(way['${dataType}'](${latMin},${lonMin},${latMax},${lonMax}););out body;>;out skel qt;`;
  const response = await fetch(requestUrl).then((response) => {
    if (response.status !== 200) {
      alert("Unable to fetch OSM data for this location.");
      throw new Error(response.statusText);
    }
    return response.json();
  });
  return response;
}

async function fetchOSMBuildingsFromBounds(bounds: LatLngBounds) {
  const elements = await fetchDataFromOsm("building", bounds).then(
    (response: OSMResponse) => response.elements
  );
  const nodeIdToLatLon = new Map<number, [number, number]>();
  elements.forEach((node) => {
    if (node.type === "node") nodeIdToLatLon.set(node.id, [node.lat, node.lon]);
  });
  const buildingElements = elements.map((element) => {
    return getBuildingGeometry(element, nodeIdToLatLon);
  });
  const nonEmptyBuildingElements = buildingElements.filter(
    (building) => building.coordinates.length > 0
  );
  return nonEmptyBuildingElements;
}

export async function fetchOsmBuildings(
  bounds: LatLngBounds,
  setOsmBuildings: React.Dispatch<React.SetStateAction<BuildingGeometry[]>>
) {
  const buildingGeometries = await fetchOSMBuildingsFromBounds(bounds);
  setOsmBuildings(buildingGeometries);
}

export async function fetchOsmRoads(
  bounds: LatLngBounds,
  setOsmRoads: React.Dispatch<React.SetStateAction<RoadGeometry[]>>
) {
  const elements = await fetchDataFromOsm("highway", bounds).then(
    (response: OSMResponse) => response.elements
  );
  const nodeIdToLatLon = new Map<number, [number, number]>();
  elements.forEach((node) => {
    if (node.type === "node") nodeIdToLatLon.set(node.id, [node.lat, node.lon]);
  });
  const roadElements = elements.map((element) => {
    return getRoadGeometry(element, nodeIdToLatLon);
  });
  const nonEmptyRoadElements = roadElements.filter(
    (road) => road.coordinates.length > 0
  );
  setOsmRoads(nonEmptyRoadElements);
}
