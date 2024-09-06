import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import * as THREE from "three";
import * as turf from "turf";
import { OsmRoadsState, ShowOsmState } from "../../raster/state";
import { fetchOsmRoads } from "../../../fetch/fetchOsm";
import { getLatLonFromString, getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, three } from "../MeshPage";
import { MeshBoundsState } from "../../state";
import { TurfPolygon } from "../../raster/drawingCanvas/types";
import { RoadGeometry } from "../../raster/types";

const ROAD_MATERIAL = new THREE.LineBasicMaterial({
  color: "#282828",
});

const ROAD_GEOMETRY_NAME = "ROAD";

const drawRoad = (
  road: RoadGeometry,
  referencePointLat: number,
  referencePointLon: number
) => {
  const roadBuffered = turf.buffer(road, 70.0) as TurfPolygon;
  const roadSimplified = turf.simplify(
    roadBuffered,
    0.01,
    false
  ) as TurfPolygon;
  const vectors = roadSimplified.geometry.coordinates[0].map(
    (point) =>
      new THREE.Vector2(
        point[1] - referencePointLon,
        point[0] - referencePointLat
      )
  );
  const shape = new THREE.Shape(vectors);
  const extrudedGeometry = new THREE.ExtrudeBufferGeometry(shape, {
    depth: 1.5,
  });
  const mesh = new THREE.Mesh(extrudedGeometry, ROAD_MATERIAL);
  mesh.name = ROAD_GEOMETRY_NAME;
  three.scene.add(mesh);
};

export function Roads() {
  const meshMapBounds = useRecoilValue(MeshBoundsState);
  const showOsm = useRecoilValue(ShowOsmState);
  const [osmRoads, setOsmRoads] = useRecoilState(OsmRoadsState);

  useEffect(() => {
    if (meshMapBounds === undefined) return;
    fetchOsmRoads(meshMapBounds.bounds, setOsmRoads);
  }, [meshMapBounds]);

  const referencePoint = getMercatorMapReferencePoint(meshMapBounds?.bounds);

  useEffect(() => {
    if (osmRoads.length === 0 || referencePoint === undefined || !showOsm)
      return;

    const { referencePointLat, referencePointLon } =
      getLatLonFromString(referencePoint);

    osmRoads.forEach((road) => {
      drawRoad(road, referencePointLat, referencePointLon);
    });
    three.renderer.render(three.scene, three.camera);
    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene, ROAD_GEOMETRY_NAME);
    };
  }, [osmRoads, referencePoint, showOsm]);
  return null;
}
