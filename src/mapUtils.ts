import { LatLngBounds } from "leaflet";
import * as turf from "turf";

export type MapBounds = {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
};

export function getMapBounds(mapBounds: LatLngBounds): MapBounds {
  const latMax = mapBounds.getNorthEast().lat;
  const latMin = mapBounds.getSouthWest().lat;
  const lonMin = mapBounds.getSouthWest().lng;
  const lonMax = mapBounds.getNorthEast().lng;
  return {
    latMin: latMin,
    latMax: latMax,
    lonMin: lonMin,
    lonMax: lonMax,
  };
}

export function getMapBoundsPolygon(bounds: MapBounds) {
  const turfBoundsPolygon = turf.polygon([
    [
      [bounds.latMin, bounds.lonMin],
      [bounds.latMin, bounds.lonMax],
      [bounds.latMax, bounds.lonMax],
      [bounds.latMax, bounds.lonMin],
      [bounds.latMin, bounds.lonMin],
    ],
  ]);
  return turfBoundsPolygon;
}
