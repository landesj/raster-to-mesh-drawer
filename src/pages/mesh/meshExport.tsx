import { TurfPolygon } from "../raster/drawingCanvas/types";

export type TurfPolygonWithHeight = {
  polygon: TurfPolygon;
  height: number;
};

export function handleMeshExport(
  drawnBuildings: TurfPolygonWithHeight[],
  groundHeight: number
) {}
