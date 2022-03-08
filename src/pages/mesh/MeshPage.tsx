import { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import * as THREE from "three";
import { CANVAS_HEIGHT } from "../raster/RasterPage";
import {
  DrawPolygonsSelector,
  BoundsState,
  OsmBuildingsState,
  OsmRoadsState,
  OsmVegetationState,
} from "../raster/state";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Button, Page } from "../style";
import { fetchOsmRoads, fetchOsmVegetation } from "../../fetch/fetchOsm";
import { getMapBounds } from "../../mapUtils";
import bbox from "@turf/bbox";
import * as turf from "turf";
import { LatLngBounds } from "leaflet";
import { toMercator } from "@turf/projection";

export const canvasSize = 1000;
export const MATERIAL = new THREE.MeshLambertMaterial({ color: "#ffffff" });
const ROAD_MATERIAL = new THREE.LineBasicMaterial({
  color: "#191919",
});
const VEGETATION_MATERIAL = new THREE.MeshBasicMaterial({ color: "#AFE1AF" });

type ReferencePoint = {
  referencePointLon: number;
  referencePointLat: number;
};

let three = {
  renderer: new THREE.WebGLRenderer(),
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(),
};

function getNormalizationConstants(minNum: number, maxNum: number) {
  const scaleFactor = 30 / (maxNum - minNum);
  const strideFactor = 15 - maxNum * scaleFactor;
  return [scaleFactor, strideFactor];
}

function getMercatorMapReferencePoint(
  mapBounds: LatLngBounds | undefined
): ReferencePoint | undefined {
  if (!mapBounds) return;
  const bounds = getMapBounds(mapBounds);
  const polygon = turf.polygon([
    [
      [bounds.latMin, bounds.lonMin],
      [bounds.latMin, bounds.lonMax],
      [bounds.latMax, bounds.lonMax],
      [bounds.latMax, bounds.lonMin],
      [bounds.latMin, bounds.lonMin],
    ],
  ]);
  const polygonMercator = toMercator(polygon);
  const polygonBbox = bbox(polygonMercator);
  const referencePointLon = (polygonBbox[3] + polygonBbox[1]) / 2;
  const referencePointLat = (polygonBbox[2] + polygonBbox[0]) / 2;
  return {
    referencePointLat: referencePointLat,
    referencePointLon: referencePointLon,
  };
}

function cleanupMeshesFromScene(scene: THREE.Scene) {
  for (let i = scene.children.length - 1; i >= 0; i--) {
    if (scene.children[i].type === "Mesh") {
      const mesh: THREE.Mesh = scene.children[i] as THREE.Mesh;
      mesh.geometry.dispose();
      // TODO: How to dispose of material
      scene.remove(mesh);
    } else if (scene.children[i].type === "Line") {
      const line: THREE.Line = scene.children[i] as THREE.Line;
      line.geometry.dispose();
      scene.remove(line);
    }
  }
}

function MeshPage() {
  const ref = useRef<HTMLCanvasElement>(null);
  const osmBuildings = useRecoilValue(OsmBuildingsState);
  const mapBounds = useRecoilValue(BoundsState);
  const drawnPolygons = useRecoilValue(DrawPolygonsSelector);
  const [showOsmBuildings, setShowOsmBuildings] = useState(false);
  const [osmRoads, setOsmRoads] = useRecoilState(OsmRoadsState);
  const [osmVegetation, setOsmVegetation] = useRecoilState(OsmVegetationState);

  const referencePoint = getMercatorMapReferencePoint(mapBounds);

  const updateShowOsmBuildings = () => {
    setShowOsmBuildings(!showOsmBuildings);
  };

  const fetchAndApplyOsmRoads = () => {
    if (mapBounds === undefined) {
      alert("Cannot fetch OSM roads");
    } else {
      fetchOsmRoads(mapBounds, setOsmRoads);
    }
  };

  const fetchAndApplyOsmVegetation = () => {
    if (mapBounds === undefined) {
      alert("Cannot fetch OSM vegetation");
    } else {
      fetchOsmVegetation(mapBounds, setOsmVegetation);
    }
  };

  const pointLight = useMemo(() => {
    return new THREE.PointLight(0xffffff, 1, 100);
  }, []);

  useEffect(() => {
    // Set up canvas
    const canvas = ref.current!;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight;

    // Create scene, add lighting
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#C8C8C8");

    const sceneAmbientLight = new THREE.AmbientLight(0x404040);
    const sceneDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(sceneAmbientLight);
    scene.add(sceneDirectionalLight);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      10000
    );
    camera.position.z = 60;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
    });

    three = {
      renderer: renderer,
      scene: scene,
      camera: camera,
    };
    renderer.render(scene, camera);
  }, []);

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

  useEffect(() => {
    if (osmVegetation.length === 0 || mapBounds === undefined) return;
    osmVegetation.forEach((vegetation) => {
      const { latMin, latMax, lonMin, lonMax } = getMapBounds(mapBounds);

      const [latScale, latStride] = getNormalizationConstants(latMin, latMax);
      const [lonScale, lonStride] = getNormalizationConstants(lonMin, lonMax);
      const vectors = vegetation.coordinates.map(
        (point: [number, number]) =>
          new THREE.Vector2(
            point[1] * lonScale + lonStride,
            point[0] * latScale + latStride
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
  }, [osmVegetation, mapBounds]);

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

  useEffect(() => {
    if (
      referencePoint === undefined ||
      drawnPolygons === undefined ||
      drawnPolygons.length === 0
    ) {
      return;
    }

    drawnPolygons.forEach((polygonWithHeight) => {
      const vectors = polygonWithHeight.polygon.geometry.coordinates[0].map(
        (point) =>
          new THREE.Vector2(
            point[1] - referencePoint.referencePointLon,
            point[0] - referencePoint.referencePointLat
          )
      );
      const polygonShape = new THREE.Shape(vectors);
      const extrudedGeometry = new THREE.ExtrudeBufferGeometry(polygonShape, {
        depth: polygonWithHeight.height,
      });
      const buildingMesh = new THREE.Mesh(extrudedGeometry, MATERIAL);
      three.scene.add(buildingMesh);
      if (polygonWithHeight.height > three.camera.position.z) {
        three.camera.position.z = polygonWithHeight.height + 20;
      }
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
  }, [drawnPolygons, referencePoint, pointLight]);

  useEffect(() => {
    const canvas = ref.current!;
    const orbit = new OrbitControls(three.camera, canvas);
    let animationId: number;
    function animate() {
      animationId = requestAnimationFrame(animate);
      three.scene.remove(pointLight);
      pointLight.position.set(
        three.camera.position.x,
        three.camera.position.y,
        three.camera.position.z
      );
      three.scene.add(pointLight);
      orbit.update();
      three.renderer.render(three.scene, three.camera);
    }
    canvas.addEventListener("mouseover", () => {
      animate();
    });
    canvas.addEventListener("mouseout", () => {
      cancelAnimationFrame(animationId);
    });
  }, [pointLight]);

  return (
    <Page>
      <canvas
        ref={ref}
        style={{ width: "100%", height: CANVAS_HEIGHT, padding: "10px" }}
      />
      <div>
        <Button onClick={fetchAndApplyOsmRoads}>Fetch OSM Roads</Button>
        <Button onClick={fetchAndApplyOsmVegetation}>Fetch OSM Parks</Button>
        {osmBuildings.length > 1 && (
          <Button onClick={updateShowOsmBuildings}>Show OSM Buildings</Button>
        )}
      </div>
    </Page>
  );
}

export default MeshPage;
