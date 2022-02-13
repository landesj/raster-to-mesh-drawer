import { LatLngBounds } from "leaflet";
import { atom } from "recoil";
import { BuildingPolygon } from "../../fetch/fetchOsm";

export const OsmBuildingsState = atom<BuildingPolygon[]>({
  key: "OsmBuildingsState",
  default: [],
});

export const OsmBoundsState = atom<LatLngBounds | undefined>({
  key: "OsmBoundsState",
  default: undefined,
});
