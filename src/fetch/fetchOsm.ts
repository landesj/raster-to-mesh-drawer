import { toMercator } from "@turf/projection";
import { LatLngBounds } from "leaflet";
import { getMapBounds } from "../mapUtils";
import * as turf from "turf";
import { OsmElement, OsmFetchError, OSMResponse, OsmType } from "./types";
import {
  BuildingGeometry,
  Coordinates,
  PolygonGeometry,
  RoadGeometry,
} from "../pages/raster/types";

const HIGHWAY_WHITELIST = [
  "residential",
  "primary",
  "secondary",
  "tertiary",
  "trunk",
  "motorway",
];

async function fetchOsmData(url: string) {
  const responseJson = await fetch(url).then((response) => {
    if (response.status !== 200) {
      alert("Unable to fetch OSM data for this location.");
      throw new OsmFetchError(response.statusText);
    }
    return response.json();
  });
  if (responseJson.elements.length === 0 && responseJson.remark) {
    alert(`Unable to fetch OSM data for this location: ${responseJson.remark}`);
    throw new OsmFetchError(responseJson.remark);
  }
  return responseJson;
}

async function fetchParksFromOsm(bounds: LatLngBounds) {
  const { latMin, latMax, lonMin, lonMax } = getMapBounds(bounds);
  const requestUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(way['leisure'='park'](${latMin},${lonMin},${latMax},${lonMax}););out body;>;out skel qt;`;
  return fetchOsmData(requestUrl);
}

async function fetchDataFromOsm(dataType: string, bounds: LatLngBounds) {
  const { latMin, latMax, lonMin, lonMax } = getMapBounds(bounds);
  const requestUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(way['${dataType}'](${latMin},${lonMin},${latMax},${lonMax}););out body;>;out skel qt;`;
  return fetchOsmData(requestUrl);
}

function getGeometry(
  element: OsmElement,
  nodeIdToLatLon: Map<number, [number, number]>
) {
  let coordinates: Coordinates = [];
  if (element.type === "way") {
    element.nodes.forEach((value) => {
      const latLon = nodeIdToLatLon.get(value);
      if (latLon !== undefined) {
        coordinates.push(latLon);
      }
    });
  }
  return {
    coordinates: coordinates,
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

async function fetchOsmPolygonsFromBounds(bounds: LatLngBounds, type: OsmType) {
  let elements;
  if (type === OsmType.BUILDING) {
    elements = await fetchDataFromOsm(type, bounds).then(
      (response: OSMResponse) => response.elements
    );
  } else {
    elements = await fetchParksFromOsm(bounds).then(
      (response: OSMResponse) => response.elements
    );
  }
  const nodeIdToLatLon = new Map<number, [number, number]>();
  elements.forEach((node) => {
    if (node.type === "node") nodeIdToLatLon.set(node.id, [node.lat, node.lon]);
  });
  const geometries = elements.map((element) => {
    return getGeometry(element, nodeIdToLatLon);
  });
  const nonEmptyBuildingElements = geometries.filter(
    (geometry) => geometry.coordinates.length > 0
  );
  return nonEmptyBuildingElements;
}

export async function fetchOsmBuildings(
  bounds: LatLngBounds,
  setOsmBuildings: React.Dispatch<React.SetStateAction<BuildingGeometry[]>>
) {
  const buildingGeometries = await fetchOsmPolygonsFromBounds(
    bounds,
    OsmType.BUILDING
  );
  setOsmBuildings(buildingGeometries);
}

export async function fetchOsmRoads(
  bounds: LatLngBounds,
  setOsmRoads: React.Dispatch<React.SetStateAction<RoadGeometry[]>>
) {
  const elements = await fetchDataFromOsm(OsmType.ROAD, bounds).then(
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
  const roadLinesMercator = nonEmptyRoadElements.map(({ coordinates }) =>
    toMercator(turf.lineString(coordinates))
  );
  setOsmRoads(roadLinesMercator);
}

export async function fetchOsmVegetation(
  bounds: LatLngBounds,
  setOsmVegetation: React.Dispatch<React.SetStateAction<PolygonGeometry[]>>
) {
  const vegetationGeometries = await fetchOsmPolygonsFromBounds(
    bounds,
    OsmType.PARK
  );
  const vegetationGeometriesMercator = vegetationGeometries.map(
    ({ coordinates }) => toMercator(turf.polygon([coordinates]))
  );
  setOsmVegetation(vegetationGeometriesMercator);
}
