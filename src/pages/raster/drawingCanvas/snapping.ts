import nearestPointOnLine from "@turf/nearest-point-on-line";
import { Feature, GeoJsonProperties, Point } from "geojson";
import * as turf from "turf";
import { SnapEvent } from "./types";
import { LineType } from "../../../assets/Line";
import { PointType } from "../../../assets/Point";

const DISTANCE_THRESHOLD = 0.00001;

function _withinDistanceThreshold(
  pointA: Feature<Point, GeoJsonProperties>,
  pointB: Feature<Point, GeoJsonProperties>
) {
  return turf.distance(pointA, pointB, "degrees") < DISTANCE_THRESHOLD;
}

export function findSnappingPoint(
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
      return { type: "point", snappingPoint: candidatePoint };
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
        type: "line",
        snappingPoint: snappingPoint,
        newLines: newLines,
        removedLine: candidateLine,
      };
    }
  }
}
