import { useState } from "react";
import { debounce } from "lodash";

type point = { x: number; y: number };

type Props = {
  isDrawing: boolean;
  points: point[];
  setPoints: React.Dispatch<React.SetStateAction<point[]>>;
};

function Point({ x, y }: point) {
  return (
    <div
      style={{
        backgroundColor: "blue",
        position: "fixed",
        left: x,
        top: y,
        width: "50px",
        height: "50px",
      }}
    ></div>
  );
}

function Drawer({ isDrawing, points, setPoints }: Props) {
  const setPointsDebounced = debounce(setPoints, 100);
  if (isDrawing) {
    const drawingPadElement = document.getElementById("drawingPad");
    drawingPadElement?.addEventListener("click", (event) => {
      setPointsDebounced([...points, { x: event.clientX, y: event.clientY }]);
    });
  }
  const drawnPoints = points.map((point: point) => Point(point));
  return <div>{drawnPoints}</div>;
}

export function MeshPage() {
  const [drawing, setDrawing] = useState<boolean>(false);
  const [points, setPoints] = useState<point[]>([]);

  const onClick = () => {
    setDrawing(!drawing);
  };
  const buttonText = drawing ? "Stop Drawing" : "Start Drawing";
  console.log(points);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h2>This is the Mesh page.</h2>
      <button onClick={onClick}>{buttonText}</button>
      <div
        id="drawingPad"
        style={{ width: "500px", height: "500px", backgroundColor: "gray" }}
      >
        <Drawer isDrawing={drawing} points={points} setPoints={setPoints} />
      </div>
    </div>
  );
}
