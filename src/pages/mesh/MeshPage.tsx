import { useState } from "react";
import { debounce } from "lodash";
import { useCallback } from "react";

type point = { x: number; y: number };

function Point({ x, y }: point) {
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
      }}
    ></span>
  );
}

export function MeshPage() {
  const [drawing, setDrawing] = useState<boolean>(false);
  const [points, setPoints] = useState<point[]>([]);

  const setPointsDebounced = debounce(setPoints, 100);

  const addPoint = useCallback(
    (event) => {
      if (drawing) {
        const newPoints = [...points, { x: event.clientX, y: event.clientY }];
        setPointsDebounced(newPoints);
      }
    },
    [points, drawing]
  );

  const onClick = () => {
    setDrawing(!drawing);
  };
  const buttonText = drawing ? "Stop Drawing" : "Start Drawing";
  const drawnPoints = points.map((point: point) => Point(point));
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
      </div>
    </div>
  );
}
