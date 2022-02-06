import { useState } from "react";
import { debounce } from "lodash";
import { useCallback } from "react";

type PointType = { x: number; y: number };
type LineType = { xSrc: number; ySrc: number; xDst: number; yDst: number };

function Line({ xSrc, ySrc, xDst, yDst }: LineType) {
  return (
    <svg
      height="500"
      width="500"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "fixed" }}
    >
      <line
        x1={xSrc}
        y1={ySrc}
        x2={xDst}
        y2={yDst}
        stroke="black"
        strokeWidth={3}
        style={{ position: "fixed", zIndex: 2 }}
      />
    </svg>
  );
}

function Point({ x, y }: PointType) {
  return (
    <span
      style={{
        height: "10px",
        width: "10px",
        backgroundColor: "#AFEEEE",
        borderRadius: "50%",
        left: x - 5,
        top: y - 5,
        position: "fixed",
        zIndex: 1,
      }}
    ></span>
  );
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
        const newPoints = [...points, { x: event.clientX, y: event.clientY }];
        const newPoint = {
          x: event.clientX - divTarget.left,
          y: event.clientY - divTarget.top,
        };
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
    [points, drawing, latestPoint]
  );

  const onClick = () => {
    setDrawing(!drawing);
  };
  const buttonText = drawing ? "Stop Drawing" : "Start Drawing";
  const drawnPoints = points.map((point: PointType) => Point(point));
  const drawnLines = lines.map((line: LineType) => Line(line));
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h2>This is the Mesh page.</h2>
      <button onClick={onClick}>{buttonText}</button>
      <div
        id="drawingPad"
        style={{ width: "500px", height: "500px", backgroundColor: "gray" }}
        onClick={addPoint}
      >
        {drawnPoints}
        {drawnLines}
      </div>
    </div>
  );
}
