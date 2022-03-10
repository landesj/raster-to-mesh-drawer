import { useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import * as THREE from "three";
import { BoundsState, OsmBuildingsState } from "../../raster/state";
import { Button } from "../../style";
import { getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, MATERIAL, three } from "../MeshPage";

export function OsmBuildings() {
  const mapBounds = useRecoilValue(BoundsState);
  const osmBuildings = useRecoilValue(OsmBuildingsState);
  const [showOsmBuildings, setShowOsmBuildings] = useState(false);

  const pointLight = useMemo(() => {
    return new THREE.PointLight(0xffffff, 1, 100);
  }, []);

  const updateShowOsmBuildings = () => {
    setShowOsmBuildings(!showOsmBuildings);
  };

  const referencePoint = getMercatorMapReferencePoint(mapBounds);
  useEffect(() => {
    if (
      referencePoint === undefined ||
      osmBuildings.length === 1 ||
      !showOsmBuildings
    ) {
      return;
    }

    osmBuildings.forEach((osmBuilding) => {
      const osmVectors = osmBuilding.coordinates.map(
        (point) =>
          new THREE.Vector2(
            point[1] - referencePoint.referencePointLon,
            point[0] - referencePoint.referencePointLat
          )
      );
      const polygonShape = new THREE.Shape(osmVectors);
      const extrudedGeometry = new THREE.ExtrudeBufferGeometry(polygonShape, {
        depth: 10,
      });
      const buildingMesh = new THREE.Mesh(extrudedGeometry, MATERIAL);
      three.scene.add(buildingMesh);
    });
    three.scene.remove(pointLight);
    pointLight.position.set(
      three.camera.position.x,
      three.camera.position.y,
      three.camera.position.z
    );
    three.scene.add(pointLight);
    three.renderer.render(three.scene, three.camera);

    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene);
    };
  }, [osmBuildings, referencePoint, pointLight, showOsmBuildings]);
  return (
    <>
      {osmBuildings.length > 1 && (
        <Button onClick={updateShowOsmBuildings}>Show OSM Buildings</Button>
      )}
    </>
  );
}
