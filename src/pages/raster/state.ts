import { atom, selector } from "recoil";
import { LineType } from "../../assets/Line";
import { PointType } from "../../assets/Point";
import {
  fetchHeightFromRaster,
  filterDuplicateCycles,
  findCycles,
  removeOverlappingCycles,
} from "./drawingCanvas/cycleWorker";
import { toMercator } from "@turf/projection";
import { Coordinates, PolygonGeometry, RoadGeometry } from "./types";
import { Graph, TurfPolygon } from "./drawingCanvas/types";
import { MapBounds } from "../../mapUtils";

export const OsmBuildingsState = atom<Coordinates[]>({
  key: "OsmBuildingsState",
  default: [],
});

export const OsmVegetationState = atom<PolygonGeometry[]>({
  key: "OsmVegetationState",
  default: [],
});

export const OsmRoadsState = atom<RoadGeometry[]>({
  key: "OsmRoadsState",
  default: [],
});

export const LeafletBoundsState = atom<MapBounds | undefined>({
  key: "LeafletBoundsState",
  default: undefined,
});

export const DrawnPointsState = atom<PointType[]>({
  key: "DrawnPointsState",
  default: [],
});

export const DrawnLinesState = atom<LineType[]>({
  key: "DrawnLinesState",
  default: [],
});

export const GroundPointListeningState = atom<boolean>({
  key: "GroundPointListeningState",
  default: false,
});

export const GroundPointState = atom<number>({
  key: "GroundPointState",
  default: 0,
});

export const ProjectSetupState = atom<boolean>({
  key: "ProjectSetupState",
  default: false,
});

export const DrawnPolygonsState = atom<
  {
    polygon: TurfPolygon;
    height: number;
  }[]
>({
  key: "DrawnPolygonsState",
  default: [],
});

export const GeoTiffState = atom<any>({
  key: "GeoTiffState",
  default: undefined,
});
