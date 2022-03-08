import { toMercator } from "@turf/projection";
import { LatLngBounds } from "leaflet";
import bbox from "@turf/bbox";
import { getMapBounds } from "../../mapUtils";
import * as turf from "turf";

type ReferencePoint = {
  referencePointLon: number;
  referencePointLat: number;
};

export function getMercatorMapReferencePoint(
  mapBounds: LatLngBounds | undefined
): ReferencePoint | undefined {
  if (!mapBounds) return;
  const bounds = getMapBounds(mapBounds);
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
  return {
    referencePointLat: referencePointLat,
    referencePointLon: referencePointLon,
  };
}
