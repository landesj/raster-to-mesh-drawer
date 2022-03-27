import { LatLngBounds } from "leaflet";

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
