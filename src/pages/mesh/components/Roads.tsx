import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import * as THREE from "three";
import * as turf from "turf";
import { OsmRoadsState } from "../../raster/state";
import { Button } from "../../style";
import { fetchOsmRoads } from "../../../fetch/fetchOsm";
import { getLatLonFromString, getMercatorMapReferencePoint } from "../utils";
import { cleanupMeshesFromScene, three } from "../MeshPage";
import { MeshBoundsState } from "../../state";
import { TurfPolygon } from "../../raster/drawingCanvas/types";
import { RoadGeometry } from "../../raster/types";

const ROAD_MATERIAL = new THREE.LineBasicMaterial({
  color: "#191919",
});

const ROAD_GEOMETRY_NAME = "ROAD";

const drawRoad = (
  road: RoadGeometry,
  referencePointLat: number,
  referencePointLon: number
) => {
  const roadBuffered = turf.buffer(road, 100.0) as TurfPolygon;
  const roadSimplified = turf.simplify(
    roadBuffered,
    0.01,
    false
  ) as TurfPolygon;
  const vectors = roadSimplified.geometry.coordinates[0].map(
    (point) =>
      new THREE.Vector2(
        point[1] - referencePointLon,
        point[0] - referencePointLat
      )
  );
  const shape = new THREE.Shape(vectors);
  const extrudedGeometry = new THREE.ExtrudeBufferGeometry(shape, {
    depth: 1.5,
  });
  const mesh = new THREE.Mesh(extrudedGeometry, ROAD_MATERIAL);
  mesh.name = ROAD_GEOMETRY_NAME;
  three.scene.add(mesh);
};

export function Roads() {
  const [roadsOrdered, setRoadsOrdered] = useState(false);
  const meshMapBounds = useRecoilValue(MeshBoundsState);
  const [osmRoads, setOsmRoads] = useRecoilState(OsmRoadsState);

  const fetchAndApplyOsmRoads = () => {
    if (meshMapBounds === undefined) {
      alert("Cannot fetch OSM roads");
    } else {
      fetchOsmRoads(meshMapBounds.bounds, setOsmRoads);
      setRoadsOrdered(true);
    }
  };

  const referencePoint = getMercatorMapReferencePoint(meshMapBounds?.bounds);

  useEffect(() => {
    if (osmRoads.length === 0 || referencePoint === undefined) return;

    const { referencePointLat, referencePointLon } =
      getLatLonFromString(referencePoint);

    osmRoads.forEach((road) => {
      drawRoad(road, referencePointLat, referencePointLon);
    });
    three.renderer.render(three.scene, three.camera);
    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene, ROAD_GEOMETRY_NAME);
    };
  }, [osmRoads, referencePoint]);
  return (
    <>
      {!roadsOrdered && (
        <Button onClick={fetchAndApplyOsmRoads}>Fetch Roads</Button>
      )}
    </>
  );
}
