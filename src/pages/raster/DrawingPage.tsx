import { debounce } from "lodash";
import { useState } from "react";
import { useMapEvent } from "react-leaflet";
import { Line, LineType } from "../../assets/Line";
import { Point, PointType } from "../../assets/Point";

type Props = { height: string; width: string };

export function DrawingCanvas(props: Props) {
  const [points, setPoints] = useState<PointType[]>([]);
  const [lines, setLines] = useState<LineType[]>([]);
  const [latestPoint, setLatestPoint] = useState<PointType | undefined>();

  const setPointsDebounced = debounce(setPoints, 100);
  const setLinesDebounced = debounce(setLines, 100);
  const setLatestPointDebounced = debounce(setLatestPoint, 100);

  useMapEvent("click", (event) => {
    console.log(event);
    const newPoint = {
      x: event.containerPoint.x,
      y: event.containerPoint.y,
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
  });
  const drawnPoints = points.map((point: PointType) =>
    Point({ height: props.height, width: props.width, point: point })
  );
  const drawnLines = lines.map((line: LineType) =>
    Line({ height: props.height, width: props.width, line: line })
  );
  console.log(drawnPoints);
  return (
    <>
      {drawnPoints}
      {drawnLines}
    </>
  );
}
