import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import * as THREE from "three";
import { OsmVegetationState, ShowOsmState } from "../../raster/state";
import { fetchOsmVegetation } from "../../../fetch/fetchOsm";
import { getLatLonFromString, getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, three } from "../MeshPage";
import { MeshBoundsState } from "../../state";
import { PolygonGeometry } from "../../raster/types";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import bbox from "@turf/bbox";

const VEGETATION_MATERIAL = new THREE.MeshBasicMaterial({ color: "#AFE1AF" });
const VEGETATION_GEOMETRY_NAME = "VEGETATION";
const TREE_SPACING = 15;

const drawVegetationArea = (
  vegetation: PolygonGeometry,
  referencePointLon: number,
  referencePointLat: number
) => {
  const vectors = vegetation.geometry.coordinates[0].map(
    (point) =>
      new THREE.Vector2(
        point[1] - referencePointLon,
        point[0] - referencePointLat
      )
  );
  const shape = new THREE.Shape(vectors);
  const extrudedGeometry = new THREE.ExtrudeBufferGeometry(shape, {
    depth: 2,
  });
  const mesh = new THREE.Mesh(extrudedGeometry, VEGETATION_MATERIAL);
  mesh.name = VEGETATION_GEOMETRY_NAME;
  three.scene.add(mesh);
};

const drawTreeRoot = (x: number, y: number, z: number) => {
  const geometry = new THREE.CylinderGeometry(1.5, 1.5, 5, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x7c3f00 });
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.name = VEGETATION_GEOMETRY_NAME;
  cylinder.position.set(x, y, z);
  cylinder.rotation.x = Math.PI / 2; // Rotate 90 degrees around the X axis
  three.scene.add(cylinder);
};

const drawTreeTop = (x: number, y: number, z: number) => {
  const geometry = new THREE.CylinderGeometry(0, 5, 15, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x234f1e });
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.name = VEGETATION_GEOMETRY_NAME;
  cylinder.position.set(x, y, z);
  cylinder.rotation.x = Math.PI / 2; // Rotate 90 degrees around the X axis
  three.scene.add(cylinder);
};

const drawTree = (x: number, y: number, z: number) => {
  drawTreeRoot(x, y, z);
  drawTreeTop(x, y, z + 10);
};

const drawTrees = (
  vegetation: PolygonGeometry,
  referencePointLon: number,
  referencePointLat: number,
  z: number
) => {
  const [minX, minY, maxX, maxY] = bbox(vegetation);
  for (let x = minX; x < maxX; x += TREE_SPACING) {
    for (let y = minY; y < maxY; y += TREE_SPACING) {
      if (booleanPointInPolygon([x, y], vegetation)) {
        drawTree(y - referencePointLon, x - referencePointLat, z);
      }
    }
  }
};

export function Vegetation() {
  const meshMapBounds = useRecoilValue(MeshBoundsState);
  const showOsm = useRecoilValue(ShowOsmState);
  const [osmVegetation, setOsmVegetation] = useRecoilState(OsmVegetationState);

  useEffect(() => {
    if (meshMapBounds === undefined) return;
    fetchOsmVegetation(meshMapBounds.bounds, setOsmVegetation);
  }, [meshMapBounds]);

  const referencePoint = getMercatorMapReferencePoint(meshMapBounds?.bounds);
  useEffect(() => {
    if (osmVegetation.length === 0 || referencePoint === undefined || !showOsm)
      return;

    const { referencePointLat, referencePointLon } =
      getLatLonFromString(referencePoint);

    osmVegetation.forEach((vegetation) => {
      drawVegetationArea(vegetation, referencePointLon, referencePointLat);
      drawTrees(vegetation, referencePointLon, referencePointLat, 3);
    });
    three.renderer.render(three.scene, three.camera);
    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene, VEGETATION_GEOMETRY_NAME);
    };
  }, [osmVegetation, referencePoint, showOsm]);
  return null;
}
