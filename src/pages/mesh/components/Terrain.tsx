import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import * as THREE from "three";
import * as turf from "turf";
import { getLatLonFromString, getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, three } from "../MeshPage";
import { MeshBoundsState } from "../../state";
import { toMercator } from "@turf/projection";

const TERRAIN_MATERIAL = new THREE.MeshBasicMaterial({ color: "#C8C8C8" });
const TERRAIN_GEOMETRY_NAME = "TERRAIN";

export function Terrain() {
  const meshMapBounds = useRecoilValue(MeshBoundsState);

  const referencePoint = getMercatorMapReferencePoint(meshMapBounds?.bounds);

  useEffect(() => {
    if (meshMapBounds === undefined || referencePoint === undefined) return;

    const turfPointMin = turf.point([
      meshMapBounds.bounds.latMin,
      meshMapBounds.bounds.lonMin,
    ]);
    const turfPointMax = turf.point([
      meshMapBounds.bounds.latMax,
      meshMapBounds.bounds.lonMax,
    ]);
    const mercatorPointMin = toMercator(turfPointMin).geometry.coordinates;
    const mercatorPointMax = toMercator(turfPointMax).geometry.coordinates;

    const { referencePointLat, referencePointLon } =
      getLatLonFromString(referencePoint);

    const vector1 = new THREE.Vector2(
      mercatorPointMin[1] - referencePointLon,
      mercatorPointMin[0] - referencePointLat
    );
    const vector2 = new THREE.Vector2(
      mercatorPointMin[1] - referencePointLon,
      mercatorPointMax[0] - referencePointLat
    );
    const vector3 = new THREE.Vector2(
      mercatorPointMax[1] - referencePointLon,
      mercatorPointMax[0] - referencePointLat
    );
    const vector4 = new THREE.Vector2(
      mercatorPointMax[1] - referencePointLon,
      mercatorPointMin[0] - referencePointLat
    );
    const vector5 = new THREE.Vector2(
      mercatorPointMin[1] - referencePointLon,
      mercatorPointMin[0] - referencePointLat
    );

    const shape = new THREE.Shape([
      vector1,
      vector2,
      vector3,
      vector4,
      vector5,
    ]);
    const geometry = new THREE.ShapeBufferGeometry(shape);
    const mesh = new THREE.Mesh(geometry, TERRAIN_MATERIAL);
    mesh.name = TERRAIN_GEOMETRY_NAME;
    three.scene.add(mesh);

    three.renderer.render(three.scene, three.camera);
    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene, TERRAIN_GEOMETRY_NAME);
    };
  }, [meshMapBounds, referencePoint]);
  return <></>;
}
