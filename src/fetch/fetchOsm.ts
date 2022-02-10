import { LatLngBounds } from "leaflet";

type Point = [number, number];

export type BuildingPolygon = Point[];

type BuildingNode = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
};

type BuildingWay = {
  type: "way";
  id: number;
  nodes: number[];
};

type BuildingElement = BuildingWay | BuildingNode;

type OSMResponse = {
  version: number;
  generator: string;
  osm3s: { timestamp_osm_base: string; copyright: string };
  elements: BuildingElement[];
};

function getBuildingGeometry(
  element: BuildingElement,
  nodeIdToLatLon: Map<number, [number, number]>
) {
  let geometry: BuildingPolygon = [];
  if (element.type === "way") {
    element.nodes.forEach((value) => {
      const latLon = nodeIdToLatLon.get(value);
      if (latLon !== undefined) {
        geometry.push(latLon);
      }
    });
  }
  return geometry;
}

async function getRequestUrlFromBBox(bounds: LatLngBounds) {
  const latMax = bounds.getNorthEast().lat;
  const latMin = bounds.getSouthWest().lat;
  const lonMin = bounds.getSouthWest().lng;
  const lonMax = bounds.getNorthEast().lng;
  const requestUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(way['building'](${latMin},${lonMin},${latMax},${lonMax}););out body;>;out skel qt;`;
  const elements = await fetch(requestUrl)
    .then((response) => {
      if (response.status !== 200) {
        alert("Unable to fetch OSM buildings for this location.");
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then((responseJson: OSMResponse) => {
      return responseJson.elements;
    });
  const nodeIdToLatLon = new Map<number, [number, number]>();
  elements.forEach((node) => {
    if (node.type === "node") nodeIdToLatLon.set(node.id, [node.lat, node.lon]);
  });
  const buildingElements = elements.map((element) => {
    return getBuildingGeometry(element, nodeIdToLatLon);
  });
  const nonEmptyBuildingElements = buildingElements.filter(
    (building) => building.length > 0
  );
  return nonEmptyBuildingElements;
}

export async function fetchOSMBuildings(
  bounds: LatLngBounds,
  setOsmBuildings: React.Dispatch<React.SetStateAction<BuildingPolygon[]>>
) {
  const buildingGeometries = await getRequestUrlFromBBox(bounds);
  setOsmBuildings(buildingGeometries);
}
