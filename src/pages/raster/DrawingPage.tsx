import { debounce } from "lodash";
import { useCallback, useState } from "react";
import { Line, LineType } from "../../assets/Line";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  Point,
  PointType,
} from "../../assets/Point";

export function DrawingCanvas() {
  const [points, setPoints] = useState<PointType[]>([]);
  const [lines, setLines] = useState<LineType[]>([]);
  const [latestPoint, setLatestPoint] = useState<PointType | undefined>();

  const setPointsDebounced = debounce(setPoints, 100);
  const setLinesDebounced = debounce(setLines, 100);
  const setLatestPointDebounced = debounce(setLatestPoint, 100);

  const addPoint = useCallback(
    (event) => {
      const divTarget = event.currentTarget.getBoundingClientRect();
      const newPoint = {
        x: event.clientX - divTarget.left,

        y: event.clientY - divTarget.top,
      };
      const newPoints = [...points, newPoint];
      setPointsDebounced(newPoints);
      if (latestPoint) {
        const newLine = {
          xSrc: latestPoint.x,
          ySrc: latestPoint.y,
          xDst: newPoint.x,
          yDst: newPoint.y,
        };
        const newLines = [...lines, newLine];
        setLinesDebounced(newLines);
      }
      setLatestPointDebounced(newPoint);
    },
    [
      points,
      latestPoint,
      lines,
      setLinesDebounced,
      setPointsDebounced,
      setLatestPointDebounced,
    ]
  );
  const drawnPoints = points.map((point: PointType) => Point(point));
  const drawnLines = lines.map((line: LineType) => Line(line));
  return (
    <div
      id="drawingPad"
      style={{
        offset: "50px",
        height: CANVAS_HEIGHT,
        width: CANVAS_WIDTH,
        backgroundColor: "#F0F8FF",
        opacity: 0.7,
        position: "absolute",
        zIndex: 10000,
      }}
      onClick={addPoint}
    >
      {drawnPoints}
      {drawnLines}
    </div>
  );
}
