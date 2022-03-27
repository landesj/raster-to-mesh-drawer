import { toMercator } from "@turf/projection";
import bbox from "@turf/bbox";
import { MapBounds } from "../../mapUtils";
import * as turf from "turf";

export function getMercatorMapReferencePoint(
  bounds: MapBounds | undefined
): string | undefined {
  if (!bounds) return;
  const polygon = turf.polygon([
    [
      [bounds.latMin, bounds.lonMin],
      [bounds.latMin, bounds.lonMax],
      [bounds.latMax, bounds.lonMax],
      [bounds.latMax, bounds.lonMin],
      [bounds.latMin, bounds.lonMin],
    ],
  ]);
  const polygonMercator = toMercator(polygon);
  const polygonBbox = bbox(polygonMercator);
  const referencePointLon = (polygonBbox[3] + polygonBbox[1]) / 2;
  const referencePointLat = (polygonBbox[2] + polygonBbox[0]) / 2;
  return `${referencePointLat},${referencePointLon}`;
}

export function getLatLonFromString(string: string) {
  return {
    referencePointLat: parseFloat(string.split(",")[0]),
    referencePointLon: parseFloat(string.split(",")[1]),
  };
}
