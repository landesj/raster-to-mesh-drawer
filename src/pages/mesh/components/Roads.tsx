import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import * as THREE from "three";
import { OsmRoadsState } from "../../raster/state";
import { Button } from "../../style";
import { fetchOsmRoads } from "../../../fetch/fetchOsm";
import { getLatLonFromString, getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, three } from "../MeshPage";
import { MeshBoundsState } from "../../state";

const ROAD_MATERIAL = new THREE.LineBasicMaterial({
  color: "#191919",
});

const ROAD_GEOMETRY_NAME = "ROAD";

export function Roads() {
  const meshMapBounds = useRecoilValue(MeshBoundsState);
  const [osmRoads, setOsmRoads] = useRecoilState(OsmRoadsState);

  const fetchAndApplyOsmRoads = () => {
    if (meshMapBounds === undefined) {
      alert("Cannot fetch OSM roads");
    } else {
      fetchOsmRoads(meshMapBounds.bounds, setOsmRoads);
    }
  };

  const referencePoint = getMercatorMapReferencePoint(meshMapBounds?.bounds);

  useEffect(() => {
    if (osmRoads.length === 0 || referencePoint === undefined) return;

    const { referencePointLat, referencePointLon } =
      getLatLonFromString(referencePoint);

    osmRoads.forEach((road) => {
      const vectors = road.geometry.coordinates.map(
        (point) =>
          new THREE.Vector2(
            point[1] - referencePointLon,
            point[0] - referencePointLat
          )
      );
      const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
      const line = new THREE.Line(geometry, ROAD_MATERIAL);
      line.name = ROAD_GEOMETRY_NAME;
      three.scene.add(line);
    });
    three.renderer.render(three.scene, three.camera);
    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene, ROAD_GEOMETRY_NAME);
    };
  }, [osmRoads, referencePoint]);
  return <Button onClick={fetchAndApplyOsmRoads}>Fetch OSM Roads</Button>;
}
