import { useState } from "react";
import { debounce } from "lodash";
import { useCallback } from "react";

type PointType = { x: number; y: number };
type LineType = { xSrc: number; ySrc: number; xDst: number; yDst: number };

const CANVAS_HEIGHT = "500px"
const CANVAS_WIDTH = "500px"

function Line({ xSrc, ySrc, xDst, yDst }: LineType) {
  return (
    <svg
      height={CANVAS_HEIGHT}
      width={CANVAS_WIDTH}
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "fixed", zIndex: 1 }}
    >
      <line
        x1={xSrc}
        y1={ySrc}
        x2={xDst}
        y2={yDst}
        stroke="black"
        strokeWidth="3"
      />
    </svg>
  );
}

function PointSVG( {x, y}: PointType) {
  return (
    <svg
      height={CANVAS_HEIGHT}
      width={CANVAS_WIDTH}
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "fixed", zIndex: 2 }}
    >
      <circle cx={x} cy={y} r="4" stroke="#AFEEEE" fill="#AFEEEE"></circle>
    </svg>
  )
}

export function MeshPage() {
  const [drawing, setDrawing] = useState<boolean>(false);
  const [points, setPoints] = useState<PointType[]>([]);
  const [lines, setLines] = useState<LineType[]>([]);
  const [latestPoint, setLatestPoint] = useState<PointType | undefined>();
  
  const setPointsDebounced = debounce(setPoints, 100);
  const setLinesDebounced = debounce(setLines, 100);
  const setLatestPointDebounced = debounce(setLatestPoint, 100);

  const addPoint = useCallback(
    (event) => {
      if (drawing) {
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
      }
    },
    [points, drawing, latestPoint, lines, setLinesDebounced, setPointsDebounced, setLatestPointDebounced]
  );

  const resetDrawing = () => {
    setDrawing(!drawing);
  };
  const buttonText = drawing ? "Stop Drawing" : "Start Drawing";
  const drawnPoints = points.map((point: PointType) => PointSVG(point));
  const drawnLines = lines.map((line: LineType) => Line(line));
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h2>This is the Mesh page.</h2>
      <button onClick={resetDrawing}>{buttonText}</button>
      <div
        id="drawingPad"
        style={{ height: CANVAS_HEIGHT, width: CANVAS_WIDTH, backgroundColor: "gray" }}
        onClick={addPoint}
      >
        {drawnPoints}
        {drawnLines}
      </div>
    </div>
  );
}
