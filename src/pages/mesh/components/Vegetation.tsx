import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import * as THREE from "three";
import { LeafletBoundsState, OsmVegetationState } from "../../raster/state";
import { fetchOsmVegetation } from "../../../fetch/fetchOsm";
import { getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, three } from "../MeshPage";
import { Button } from "../../style";
import { MeshBoundsState } from "../../state";

const VEGETATION_MATERIAL = new THREE.MeshBasicMaterial({ color: "#AFE1AF" });

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
    osmVegetation.forEach((vegetation) => {
      const vectors = vegetation.geometry.coordinates[0].map(
        (point) =>
          new THREE.Vector2(
            point[1] - referencePoint.referencePointLon,
            point[0] - referencePoint.referencePointLat
          )
      );
      const shape = new THREE.Shape(vectors);
      const geometry = new THREE.ShapeBufferGeometry(shape);
      const mesh = new THREE.Mesh(geometry, VEGETATION_MATERIAL);
      three.scene.add(mesh);
    });
    three.renderer.render(three.scene, three.camera);
    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene);
    };
  }, [osmVegetation, referencePoint]);
  return <Button onClick={fetchAndApplyOsmVegetation}>Fetch OSM Parks</Button>;
}
