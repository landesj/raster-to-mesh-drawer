import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import * as THREE from "three";
import { BoundsState, OsmRoadsState } from "../../raster/state";
import { Button } from "../../style";
import { fetchOsmRoads } from "../../../fetch/fetchOsm";
import { getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, three } from "../MeshPage";

const ROAD_MATERIAL = new THREE.LineBasicMaterial({
  color: "#191919",
});

export function Roads() {
  const mapBounds = useRecoilValue(BoundsState);
  const [osmRoads, setOsmRoads] = useRecoilState(OsmRoadsState);

  const fetchAndApplyOsmRoads = () => {
    if (mapBounds === undefined) {
      alert("Cannot fetch OSM roads");
    } else {
      fetchOsmRoads(mapBounds, setOsmRoads);
    }
  };

  const referencePoint = getMercatorMapReferencePoint(mapBounds);
  useEffect(() => {
    if (osmRoads.length === 0 || referencePoint === undefined) return;
    osmRoads.forEach((road) => {
      const vectors = road.geometry.coordinates.map(
        (point) =>
          new THREE.Vector2(
            point[1] - referencePoint.referencePointLon,
            point[0] - referencePoint.referencePointLat
          )
      );
      const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
      const line = new THREE.Line(geometry, ROAD_MATERIAL);
      three.scene.add(line);
    });
    three.renderer.render(three.scene, three.camera);
    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene);
    };
  }, [osmRoads, referencePoint]);
  return <Button onClick={fetchAndApplyOsmRoads}>Fetch OSM Roads</Button>;
}
