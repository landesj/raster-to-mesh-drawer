import { useState } from "react";
import { debounce } from "lodash";
import { useCallback } from "react";

type point = { x: number; y: number };

function Point({ x, y }: point) {
  return (
    <div
      style={{
        backgroundColor: "blue",
        position: "fixed",
        left: x,
        top: y,
        width: "10px",
        height: "10px",
      }}
    ></div>
  );
}

export function MeshPage() {
  const [drawing, setDrawing] = useState<boolean>(false);
  const [points, setPoints] = useState<point[]>([]);

  const setPointsDebounced = debounce(setPoints, 100);

  const addPoint = useCallback((event) => {
    if (drawing) {
      const newPoints = [...points, { x: event.clientX, y: event.clientY }]
      setPointsDebounced(newPoints);
    }
  }, [points, drawing])

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
