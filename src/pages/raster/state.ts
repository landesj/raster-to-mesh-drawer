import { LatLngBounds } from "leaflet";
import { atom, selector } from "recoil";
import { LineType } from "../../assets/Line";
import { PointType } from "../../assets/Point";
import { BuildingPolygon } from "../../fetch/fetchOsm";
import {
  filterDuplicateCycles,
  findCycles,
  removeOverlappingCycles,
} from "./cycleUtils";

export const OsmBuildingsState = atom<BuildingPolygon[]>({
  key: "OsmBuildingsState",
  default: [],
});

export const OsmBoundsState = atom<LatLngBounds | undefined>({
  key: "OsmBoundsState",
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
    return distinctPolygons;
  },
});
