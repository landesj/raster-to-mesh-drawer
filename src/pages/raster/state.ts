import { LatLngBounds } from "leaflet";
import { atom, selector } from "recoil";
import { LineType } from "../../assets/Line";
import { PointType } from "../../assets/Point";
import { BuildingGeometry, Geometry, RoadGeometry } from "../../fetch/fetchOsm";
import {
  fetchHeightFromRaster,
  filterDuplicateCycles,
  findCycles,
  removeOverlappingCycles,
} from "./cycleUtils";
import { toMercator } from "@turf/projection";

export const OsmBuildingsState = atom<BuildingGeometry[]>({
  key: "OsmBuildingsState",
  default: [],
});

export const OsmBuildingsLatLngState = atom<Geometry[]>({
  key: "OsmBuildingsState",
  default: [],
});

export const OsmVegetationState = atom<Geometry[]>({
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
    const adjacencies = new Map<string, [number, number][]>();
    drawnLines.forEach((line: LineType) => {
      const pointSrc: [number, number] = [line.latSrc, line.lngSrc];
      const pointDst: [number, number] = [line.latDst, line.lngDst];
      const pointSrcAdjacencies = adjacencies.get(pointSrc.toString());
      if (pointSrcAdjacencies) {
        adjacencies.set(pointSrc.toString(), [
          ...pointSrcAdjacencies,
          pointDst,
        ]);
      } else {
        adjacencies.set(pointSrc.toString(), [pointDst]);
      }
      const pointDstAdjacencies = adjacencies.get(pointDst.toString());
      if (pointDstAdjacencies) {
        adjacencies.set(pointDst.toString(), [
          ...pointDstAdjacencies,
          pointSrc,
        ]);
      } else {
        adjacencies.set(pointDst.toString(), [pointSrc]);
      }
    });
    const cycles = findCycles(adjacencies);
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
