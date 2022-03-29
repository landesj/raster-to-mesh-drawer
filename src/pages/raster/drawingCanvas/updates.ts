import { atom } from "recoil";
import { LineType } from "../../../assets/Line";
import { PointType } from "../../../assets/Point";
import {
  ActionType,
  DrawingAction,
  DrawingLineAction,
  DrawingPointAction,
  HistoryState,
} from "./types";

export const ActionsHistoryState = atom<HistoryState[]>({
  key: "ActionsHistoryState",
  default: [],
});

function _lineEquals(lineA: LineType, lineB: LineType): boolean {
  return (
    lineA.latSrc === lineB.latSrc &&
    lineA.lngSrc === lineB.lngSrc &&
    lineA.latDst === lineB.latDst &&
    lineA.lngDst === lineB.lngDst
  );
}

export function addPointAction(
  actions: DrawingAction[],
  actionType: ActionType,
  geometry: PointType
) {
  actions.push({
    actionType: actionType,
    action: { geometryType: "point", geometry: geometry },
  });
}

export function addLineAction(
  actions: DrawingAction[],
  actionType: ActionType,
  geometry: LineType
) {
  actions.push({
    actionType: actionType,
    action: { geometryType: "line", geometry: geometry },
  });
}

export function updateLines(
  currentLines: LineType[],
  newLines: LineType[],
  removeableLine: LineType | undefined
) {
  let updatedLines = [...currentLines, ...newLines];
  if (removeableLine) {
    updatedLines = updatedLines.filter(
      (line) => !_lineEquals(line, removeableLine)
    );
  }
  return updatedLines;
}

export function undoPointAction(
  actionType: string,
  action: DrawingPointAction,
  points: PointType[]
) {
  switch (actionType) {
    case "add": {
      const removedPoint = action.geometry;
      const pointsFiltered = points.filter(
        (point) =>
          point.lat !== removedPoint.lat && point.lng !== removedPoint.lng
      );
      return pointsFiltered;
    }
    case "remove": {
      const addedPoint = action.geometry;
      const newPoints = [...points, addedPoint];
      return newPoints;
    }
    default:
      return points;
  }
}

export function undoLineAction(
  actionType: string,
  action: DrawingLineAction,
  lines: LineType[]
) {
  switch (actionType) {
    case "add": {
      const removedLine = action.geometry;
      const linesFiltered = lines.filter(
        (line) => !_lineEquals(line, removedLine)
      );
      return linesFiltered;
    }
    case "remove": {
      const addedLine = action.geometry;
      const newLines = [...lines, addedLine];
      return newLines;
    }
    default:
      return lines;
  }
}
