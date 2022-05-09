import { useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import * as THREE from "three";
import { OsmBuildingsState } from "../../raster/state";
import { Button } from "../../style";
import { getLatLonFromString, getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, MATERIAL, three } from "../MeshPage";
import { MeshBoundsState } from "../../state";

const OSM_BUILDING_GEOMETRY_NAME = "OSM_BUILDING";

export function OsmBuildings() {
  const meshMapBounds = useRecoilValue(MeshBoundsState);
  const osmBuildings = useRecoilValue(OsmBuildingsState);
  const [showOsmBuildings, setShowOsmBuildings] = useState(false);

  const pointLight = useMemo(() => {
    return new THREE.PointLight(0xffffff, 1, 100);
  }, []);

  const updateShowOsmBuildings = () => {
    setShowOsmBuildings(!showOsmBuildings);
  };

  const referencePoint = getMercatorMapReferencePoint(meshMapBounds?.bounds);
  useEffect(() => {
    if (
      referencePoint === undefined ||
      osmBuildings.length === 1 ||
      !showOsmBuildings
    ) {
      return;
    }

    const { referencePointLat, referencePointLon } =
      getLatLonFromString(referencePoint);

    osmBuildings.forEach((osmBuilding) => {
      const osmVectors = osmBuilding.map(
        (point) =>
          new THREE.Vector2(
            point[1] - referencePointLon,
            point[0] - referencePointLat
          )
      );
      const polygonShape = new THREE.Shape(osmVectors);
      const extrudedGeometry = new THREE.ExtrudeBufferGeometry(polygonShape, {
        depth: 10,
      });
      const buildingMesh = new THREE.Mesh(extrudedGeometry, MATERIAL);
      buildingMesh.name = OSM_BUILDING_GEOMETRY_NAME;
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
      cleanupMeshesFromScene(three.scene, OSM_BUILDING_GEOMETRY_NAME);
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
