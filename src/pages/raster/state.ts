import { LatLngBounds } from "leaflet";
import { atom, selector } from "recoil";
import { LineType } from "../../assets/Line";
import { PointType } from "../../assets/Point";
import {
  fetchHeightFromRaster,
  filterDuplicateCycles,
  findCycles,
  removeOverlappingCycles,
} from "./drawingCanvas/cycleUtils";
import { toMercator } from "@turf/projection";
import { BuildingGeometry, PolygonGeometry, RoadGeometry } from "./types";
import { Graph } from "./drawingCanvas/types";

export const OsmBuildingsState = atom<BuildingGeometry[]>({
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

export const BoundsState = atom<LatLngBounds | undefined>({
  key: "BoundsState",
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

export const DrawPolygonsSelector = selector({
  key: "DrawnPolygonsSelector",
  get: ({ get }) => {
    const drawnLines = get(DrawnLinesState);
    const georaster = get(GeoTiffState);
    if (georaster === undefined) return [];
    const adjacencyGraph = new Graph();
    adjacencyGraph.createGraphFromListOfLines(drawnLines);
    const cycles = findCycles(adjacencyGraph);
    const uniqueCycles = filterDuplicateCycles(cycles);
    const distinctPolygons = removeOverlappingCycles(uniqueCycles);
    const polygonsWithHeight = fetchHeightFromRaster(
      distinctPolygons,
      georaster
    );
    const polygonsWithHeightTranslated = polygonsWithHeight.map(
      ({ polygon, height }) => {
        return {
          polygon: toMercator(polygon),
          height: height,
        };
      }
    );
    return polygonsWithHeightTranslated;
  },
});

export const GeoTiffState = atom({
  key: "GeoTiffState",
  default: undefined,
});
