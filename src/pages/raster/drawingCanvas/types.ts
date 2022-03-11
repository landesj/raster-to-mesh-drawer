import { LineType } from "../../../assets/Line";
import { PointType } from "../../../assets/Point";

export type DrawingPointAction = {
  geometryType: "point";
  geometry: PointType;
};

export type DrawingLineAction = {
  geometryType: "line";
  geometry: LineType;
};

export type ActionType = "add" | "remove";

export type GeometryType = "point" | "line";

export type DrawingAction = {
  actionType: ActionType;
  action: DrawingPointAction | DrawingLineAction;
};

export type HistoryState = {
  actions: DrawingAction[];
  latestPoint: PointType | undefined;
};

export type SnapEvent = {
  type: GeometryType;
  snappingPoint?: PointType;
  newLines?: LineType[];
  removedLine?: LineType;
};
