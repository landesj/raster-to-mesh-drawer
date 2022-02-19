import { debounce } from "lodash";
import { useState } from "react";
import { useMapEvent } from "react-leaflet";
import { Line, LineType } from "../../assets/Line";
import { Point, PointType } from "../../assets/Point";
import { v4 as uuidv4 } from "uuid";
import * as turf from "turf";

const DISTANCE_THRESHOLD = 0.00001;

function findSnappingPoint(
  point: PointType,
  candidatePoints: PointType[]
): PointType | undefined {
  const turfPoint = turf.point([point.lat, point.lng]);
  for (const candidatePoint of candidatePoints) {
    const turfCandidatePoint = turf.point([
      candidatePoint.lat,
      candidatePoint.lng,
    ]);
    if (
      turf.distance(turfPoint, turfCandidatePoint, "degrees") <
      DISTANCE_THRESHOLD
    ) {
      return candidatePoint;
    }
  }
}

export function DrawingCanvas() {
  const [points, setPoints] = useState<PointType[]>([]);
  const [lines, setLines] = useState<LineType[]>([]);
  const [latestPoint, setLatestPoint] = useState<PointType | undefined>();

  const setPointsDebounced = debounce(setPoints, 100);
  const setLinesDebounced = debounce(setLines, 100);
  const setLatestPointDebounced = debounce(setLatestPoint, 100);

  useMapEvent("click", (event) => {
    let newPoint = {
      lat: event.latlng.lat,
      lng: event.latlng.lng,
    };
    const snapNewPoint = findSnappingPoint(newPoint, points);
    if (snapNewPoint !== undefined) {
      newPoint = snapNewPoint;
      setLatestPointDebounced(undefined);
    } else {
      setLatestPointDebounced(newPoint);
    }
    const newPoints = [...points, newPoint];

    setPointsDebounced(newPoints);
    if (latestPoint) {
      const newLine = {
        latSrc: latestPoint.lat,
        lngSrc: latestPoint.lng,
        latDst: newPoint.lat,
        lngDst: newPoint.lng,
      };
      const newLines = [...lines, newLine];
      setLinesDebounced(newLines);
    }
  });
  const drawnPoints = points.map((point: PointType) =>
    Point({ key: uuidv4(), point: point })
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
