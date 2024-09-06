import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import * as THREE from "three";
import { OsmVegetationState } from "../../raster/state";
import { fetchOsmVegetation } from "../../../fetch/fetchOsm";
import { getLatLonFromString, getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, three } from "../MeshPage";
import { Button } from "../../style";
import { MeshBoundsState } from "../../state";
import { PolygonGeometry } from "../../raster/types";

const VEGETATION_MATERIAL = new THREE.MeshBasicMaterial({ color: "#AFE1AF" });
const VEGETATION_GEOMETRY_NAME = "VEGETATION";

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

const drawTreeRoot = () => {
  const geometry = new THREE.CylinderGeometry(1.5, 1.5, 5, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x7c3f00 });
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.set(10, 20, 30);
  cylinder.rotation.x = Math.PI / 2; // Rotate 90 degrees around the X axis
  three.scene.add(cylinder);
};

const drawTreeTop = () => {
  const geometry = new THREE.CylinderGeometry(0, 5, 15, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x234f1e });
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.set(10, 20, 40);
  cylinder.rotation.x = Math.PI / 2; // Rotate 90 degrees around the X axis
  three.scene.add(cylinder);
};

const drawTrees = () => {
  drawTreeRoot();
  drawTreeTop();
};

export function Vegetation() {
  const [vegetationOrdered, setVegetationOrdered] = useState(false);
  const meshMapBounds = useRecoilValue(MeshBoundsState);
  const [osmVegetation, setOsmVegetation] = useRecoilState(OsmVegetationState);

  const fetchAndApplyOsmVegetation = () => {
    if (meshMapBounds === undefined) {
      alert("Cannot fetch OSM vegetation");
    } else {
      fetchOsmVegetation(meshMapBounds.bounds, setOsmVegetation);
      setVegetationOrdered(true);
    }
  };

  const referencePoint = getMercatorMapReferencePoint(meshMapBounds?.bounds);
  useEffect(() => {
    if (osmVegetation.length === 0 || referencePoint === undefined) return;

    const { referencePointLat, referencePointLon } =
      getLatLonFromString(referencePoint);

    osmVegetation.forEach((vegetation) => {
      drawVegetationArea(vegetation, referencePointLon, referencePointLat);
      drawTrees();
    });
    three.renderer.render(three.scene, three.camera);
    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene, VEGETATION_GEOMETRY_NAME);
    };
  }, [osmVegetation, referencePoint]);
  return (
    <>
      {!vegetationOrdered && (
        <Button onClick={fetchAndApplyOsmVegetation}>Fetch Parks</Button>
      )}
    </>
  );
}
