import { useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import * as THREE from "three";
import * as turf from "turf";
import { DrawnPolygonsState, GroundPointState } from "../../raster/state";
import { MeshBoundsState } from "../../state";
import { cleanupMeshesFromScene, orbitControls, three } from "../MeshPage";
import { getLatLonFromString, getMercatorMapReferencePoint } from "../utils";

export const BUILDING_MATERIAL = new THREE.MeshLambertMaterial({
  color: "#ffffff",
});

const DRAWN_BUILDING_GEOMETRY_NAME = "DRAWN_BUILDING";

export function DrawnBuildings() {
  const groundHeight = useRecoilValue(GroundPointState);
  const meshMapBounds = useRecoilValue(MeshBoundsState);
  const drawnPolygons = useRecoilValue(DrawnPolygonsState);
  const [isCameraSet, setCamera] = useState(false);

  const referencePoint = getMercatorMapReferencePoint(meshMapBounds?.bounds);

  const pointLight = useMemo(() => {
    return new THREE.PointLight(0xffffff, 1, 100);
  }, []);

  useEffect(() => {
    if (
      referencePoint === undefined ||
      drawnPolygons === undefined ||
      drawnPolygons.length === 0
    ) {
      return;
    }

    const { referencePointLat, referencePointLon } =
      getLatLonFromString(referencePoint);

    drawnPolygons.forEach((polygonWithHeight) => {
      const vectors = polygonWithHeight.polygon.geometry.coordinates[0].map(
        (point) =>
          new THREE.Vector2(
            point[1] - referencePointLon,
            point[0] - referencePointLat
          )
      );
      const polygonShape = new THREE.Shape(vectors);
      const extrudedGeometry = new THREE.ExtrudeBufferGeometry(polygonShape, {
        depth: polygonWithHeight.height - groundHeight,
      });
      const buildingMesh = new THREE.Mesh(extrudedGeometry, BUILDING_MATERIAL);
      buildingMesh.name = DRAWN_BUILDING_GEOMETRY_NAME;
      three.scene.add(buildingMesh);
      if (polygonWithHeight.height > three.camera.position.z) {
        three.camera.position.z = polygonWithHeight.height + 20;
        orbitControls.update();
      }
    });

    if (!isCameraSet) {
      const featureCollection = turf.featureCollection(
        drawnPolygons.map((polygonWithHeight) => polygonWithHeight.polygon)
      );
      const bbox = turf.bbox(featureCollection);
      const yPosition = (bbox[2] + bbox[0]) / 2 - referencePointLat;
      const xPosition = (bbox[3] + bbox[1]) / 2 - referencePointLon;
      orbitControls.target.set(xPosition, yPosition, 0);
      orbitControls.update();

      setCamera(true);
    }

    three.scene.remove(pointLight);
    pointLight.position.set(
      three.camera.position.x,
      three.camera.position.y,
      three.camera.position.z
    );
    three.scene.add(pointLight);
    three.renderer.render(three.scene, three.camera);

    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene, DRAWN_BUILDING_GEOMETRY_NAME);
    };
  }, [drawnPolygons, referencePoint, pointLight, isCameraSet, groundHeight]);
  return <></>;
}
