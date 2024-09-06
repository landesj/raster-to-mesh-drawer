import { atom } from "recoil";
import { LineType } from "../../assets/Line";
import { PointType } from "../../assets/Point";
import { Coordinates, PolygonGeometry, RoadGeometry } from "./types";
import { TurfPolygon } from "./drawingCanvas/types";

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

export const RasterState = atom<ArrayBuffer | null>({
  key: "RasterState",
  default: null,
});
