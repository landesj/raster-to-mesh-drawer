import { debounce } from "lodash";
import { useState } from "react";
import { useMapEvent } from "react-leaflet";
import { Line, LineType } from "../../assets/Line";
import { MapPoint, PointType } from "../../assets/Point";
import { v4 as uuidv4 } from "uuid";
import * as turf from "turf";
import { atom, useRecoilState } from "recoil";
import { DrawnLinesState, DrawnPointsState } from "./state";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import { Feature, GeoJsonProperties, Point } from "geojson";

const DISTANCE_THRESHOLD = 0.00001;

type SnapEvent = {
  snappingPoint?: PointType;
  newLines?: LineType[];
  removedLine?: LineType;
};

function _withinDistanceThreshold(
  pointA: Feature<Point, GeoJsonProperties>,
  pointB: Feature<Point, GeoJsonProperties>
) {
  return turf.distance(pointA, pointB, "degrees") < DISTANCE_THRESHOLD;
}

function _lineEquals(lineA: LineType, lineB: LineType): boolean {
  return (
    lineA.latSrc === lineB.latSrc &&
    lineA.lngSrc === lineB.lngSrc &&
    lineA.latDst === lineB.latDst &&
    lineA.lngDst === lineB.lngDst
  );
}

function _updateLines(
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

function findSnappingPoint(
  point: PointType,
  candidatePoints: PointType[],
  candidateLines: LineType[]
): SnapEvent | undefined {
  const turfPoint = turf.point([point.lat, point.lng]);
  for (const candidatePoint of candidatePoints) {
    const turfCandidatePoint = turf.point([
      candidatePoint.lat,
      candidatePoint.lng,
    ]);
    if (_withinDistanceThreshold(turfPoint, turfCandidatePoint)) {
      return { snappingPoint: candidatePoint };
    }
  }
  for (const candidateLine of candidateLines) {
    const turfCandidateLine = turf.lineString([
      [candidateLine.latSrc, candidateLine.lngSrc],
      [candidateLine.latDst, candidateLine.lngDst],
    ]);
    const snappedPoint = nearestPointOnLine(turfCandidateLine, turfPoint, {
      units: "degrees",
    }) as Feature<Point, GeoJsonProperties>;
    if (_withinDistanceThreshold(turfPoint, snappedPoint)) {
      const lat = snappedPoint.geometry.coordinates[0];
      const lng = snappedPoint.geometry.coordinates[1];
      const newLines = [
        {
          latSrc: candidateLine.latSrc,
          lngSrc: candidateLine.lngSrc,
          latDst: lat,
          lngDst: lng,
        },
        {
          latSrc: candidateLine.latDst,
          lngSrc: candidateLine.lngDst,
          latDst: lat,
          lngDst: lng,
        },
      ];
      const snappingPoint = {
        lat: snappedPoint.geometry.coordinates[0],
        lng: snappedPoint.geometry.coordinates[1],
      };
      return {
        snappingPoint: snappingPoint,
        newLines: newLines,
        removedLine: candidateLine,
      };
    }
  }
}

type DrawingAction = {
  action: "add" | "remove";
  geometry: PointType | LineType;
};

const ActionsHistoryState = atom<DrawingAction[][]>({
  key: "ActionsHistoryState",
  default: [],
});

export function DrawingCanvas() {
  const [points, setPoints] = useRecoilState(DrawnPointsState);
  const [lines, setLines] = useRecoilState(DrawnLinesState);
  const [history, setHistory] = useRecoilState(ActionsHistoryState);
  const [latestPoint, setLatestPoint] = useState<PointType | undefined>();

  const setPointsDebounced = debounce(setPoints, 100);
  const setLinesDebounced = debounce(setLines, 100);
  const setLatestPointDebounced = debounce(setLatestPoint, 100);
  const setHistoryDebounced = debounce(setHistory, 100);

  console.log(history);

  useMapEvent("click", (event) => {
    let actions: DrawingAction[] = [];
    let newPoint = {
      lat: event.latlng.lat,
      lng: event.latlng.lng,
    };
    let newLines = [];
    const snapNewPoint = findSnappingPoint(newPoint, points, lines);
    if (snapNewPoint && snapNewPoint.snappingPoint) {
      newPoint = snapNewPoint.snappingPoint;
      latestPoint
        ? setLatestPointDebounced(undefined)
        : setLatestPointDebounced(newPoint);
    } else {
      setLatestPointDebounced(newPoint);
    }
    const newPoints = [...points, newPoint];
    actions.push({
      action: "add",
      geometry: newPoint,
    });

    setPointsDebounced(newPoints);
    if (latestPoint) {
      const newLine = {
        latSrc: latestPoint.lat,
        lngSrc: latestPoint.lng,
        latDst: newPoint.lat,
        lngDst: newPoint.lng,
      };
      newLines.push(newLine);
    }
    if (snapNewPoint && snapNewPoint.newLines) {
      newLines = [...newLines, ...snapNewPoint.newLines];
    }

    newLines.forEach((newLine) =>
      actions.push({ action: "add", geometry: newLine })
    );
    if (snapNewPoint && snapNewPoint.removedLine) {
      actions.push({ action: "remove", geometry: snapNewPoint.removedLine });
    }

    const updatedLines = _updateLines(
      lines,
      newLines,
      snapNewPoint?.removedLine
    );
    setLinesDebounced(updatedLines);
    setHistoryDebounced([...history, actions]);
  });
  const drawnPoints = points.map((point: PointType) =>
    MapPoint({ key: uuidv4(), point: point })
  );
  const drawnLines = lines.map((line: LineType) =>
    Line({ key: uuidv4(), line: line })
  );
  return (
    <>
      {drawnPoints}
      {drawnLines}
    </>
  );
}
