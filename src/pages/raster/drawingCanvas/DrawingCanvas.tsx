import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { useMapEvent } from "react-leaflet";
import { Line, LineType } from "../../../assets/Line";
import { MapPoint, PointType } from "../../../assets/Point";
import { v4 as uuidv4 } from "uuid";
import { useRecoilState } from "recoil";
import { DrawnLinesState, DrawnPointsState } from "../state";
import { DrawingAction } from "./types";
import { findSnappingPoint } from "./snapping";
import {
  ActionsHistoryState,
  addLineAction,
  addPointAction,
  undoLineAction,
  undoPointAction,
  updateLines,
} from "./updates";

export function DrawingCanvas() {
  const [points, setPoints] = useRecoilState(DrawnPointsState);
  const [lines, setLines] = useRecoilState(DrawnLinesState);
  const [history, setHistory] = useRecoilState(ActionsHistoryState);
  const [historyIndex, setHistoryIndex] = useState<number | undefined>(
    undefined
  );
  const [latestPoint, setLatestPoint] = useState<PointType | undefined>();

  const setPointsDebounced = debounce(setPoints, 100);
  const setLinesDebounced = debounce(setLines, 100);
  const setLatestPointDebounced = debounce(setLatestPoint, 100);
  const setHistoryDebounced = debounce(setHistory, 100);
  const setHistoryIndexDebounced = debounce(setHistoryIndex, 100);

  useEffect(() => {
    document.onkeydown = (event) => {
      if (event.key === "z" && event.metaKey) {
        event.stopImmediatePropagation();
        if (
          history.length === 0 ||
          historyIndex === undefined ||
          historyIndex < 0
        )
          return;

        let newPoints = points;
        let newLines = lines;

        const { actions, latestPoint } = history[historyIndex];
        actions.forEach((action: DrawingAction) => {
          if (action.action.geometryType === "point") {
            newPoints = undoPointAction(
              action.actionType,
              action.action,
              newPoints
            );
          } else {
            newLines = undoLineAction(
              action.actionType,
              action.action,
              newLines
            );
          }
        });

        setPointsDebounced(newPoints);
        setLinesDebounced(newLines);
        setLatestPointDebounced(latestPoint);
        setHistory(history.slice(0, historyIndex));
        setHistoryIndexDebounced(historyIndex - 1);
      }
    };
  }, [
    history,
    lines,
    points,
    setPointsDebounced,
    setLinesDebounced,
    historyIndex,
    setHistory,
    setLatestPointDebounced,
    setHistoryIndexDebounced,
  ]);

  useMapEvent("click", (event) => {
    let actions: DrawingAction[] = [];
    let newPoint = {
      lat: event.latlng.lat,
      lng: event.latlng.lng,
    };
    let newLines = [];
    let newPoints = points;
    const snapNewPoint = findSnappingPoint(newPoint, points, lines);
    if (snapNewPoint && snapNewPoint.snappingPoint) {
      newPoint = snapNewPoint.snappingPoint;
      latestPoint
        ? setLatestPointDebounced(undefined)
        : setLatestPointDebounced(newPoint);
      if (snapNewPoint.type === "line") {
        newPoints = [...points, newPoint];
        addPointAction(actions, "add", newPoint);
      }
    } else {
      newPoints = [...points, newPoint];
      addPointAction(actions, "add", newPoint);
      setLatestPointDebounced(newPoint);
    }

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

    newLines.forEach((newLine) => addLineAction(actions, "add", newLine));
    if (snapNewPoint && snapNewPoint.removedLine) {
      addLineAction(actions, "remove", snapNewPoint.removedLine);
    }

    const updatedLines = updateLines(
      lines,
      newLines,
      snapNewPoint?.removedLine
    );
    setLinesDebounced(updatedLines);
    const newHistory = [
      ...history,
      { actions: actions, latestPoint: latestPoint },
    ];
    setHistoryDebounced(newHistory);
    setHistoryIndexDebounced(newHistory.length - 1);
  });
  const drawnPoints = points.map((point: PointType) =>
    MapPoint({ key: uuidv4(), point: point })
  );
  const drawnLines = lines.map((line: LineType) =>
    Line({ key: uuidv4(), line: line })
  );
  return (
    <div>
      {drawnPoints}
      {drawnLines}
    </div>
  );
}
