import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import * as THREE from "three";
import { OsmVegetationState } from "../../raster/state";
import { fetchOsmVegetation } from "../../../fetch/fetchOsm";
import { getLatLonFromString, getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, three } from "../MeshPage";
import { Button } from "../../style";
import { MeshBoundsState } from "../../state";

const VEGETATION_MATERIAL = new THREE.MeshBasicMaterial({ color: "#AFE1AF" });
const VEGETATION_GEOMETRY_NAME = "VEGETATION";

export function Vegetation() {
  const meshMapBounds = useRecoilValue(MeshBoundsState);
  const [osmVegetation, setOsmVegetation] = useRecoilState(OsmVegetationState);

  const fetchAndApplyOsmVegetation = () => {
    if (meshMapBounds === undefined) {
      alert("Cannot fetch OSM vegetation");
    } else {
      fetchOsmVegetation(meshMapBounds.bounds, setOsmVegetation);
    }
  };

  const referencePoint = getMercatorMapReferencePoint(meshMapBounds?.bounds);
  useEffect(() => {
    if (osmVegetation.length === 0 || referencePoint === undefined) return;

    const { referencePointLat, referencePointLon } =
      getLatLonFromString(referencePoint);

    osmVegetation.forEach((vegetation) => {
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
    });
    three.renderer.render(three.scene, three.camera);
    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene, VEGETATION_GEOMETRY_NAME);
    };
  }, [osmVegetation, referencePoint]);
  return <Button onClick={fetchAndApplyOsmVegetation}>Fetch Parks</Button>;
}
