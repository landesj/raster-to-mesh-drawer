import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import * as THREE from "three";
import { CANVAS_HEIGHT } from "../raster/RasterPage";
import {
  DrawPolygonsSelector,
  BoundsState,
  OsmBuildingsState,
} from "../raster/state";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Page } from "../style";

export const canvasSize = 1000;
export const MATERIAL = new THREE.MeshLambertMaterial({ color: "#FFFAF0" });

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

function cleanupMeshesFromScene(scene: THREE.Scene) {
  for (let i = scene.children.length - 1; i >= 0; i--) {
    if (scene.children[i].type === "Mesh") {
      const mesh: THREE.Mesh = scene.children[i] as THREE.Mesh;
      mesh.geometry.dispose();
      // TODO: How to dispose of material
      scene.remove(mesh);
    }
  }
}

function MeshPage() {
  const ref = useRef<HTMLCanvasElement>(null);
  const osmBuildings = useRecoilValue(OsmBuildingsState);
  const mapBounds = useRecoilValue(BoundsState);
  const drawnPolygons = useRecoilValue(DrawPolygonsSelector);

  let cameraHeight = 40;

  useEffect(() => {
    // Set up canvas
    const canvas = ref.current!;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight;

    // Create scene, add lighting
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#C8C8C8");
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      10000
    );
    camera.position.z = cameraHeight;

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
    if (mapBounds === undefined || osmBuildings.length === 1) {
      return;
    }

    const latMax = mapBounds.getNorthEast().lat;
    const latMin = mapBounds.getSouthWest().lat;
    const lonMin = mapBounds.getSouthWest().lng;
    const lonMax = mapBounds.getNorthEast().lng;

    const [latScale, latStride] = getNormalizationConstants(latMin, latMax);
    const [lonScale, lonStride] = getNormalizationConstants(lonMin, lonMax);

    osmBuildings.forEach((osmBuilding) => {
      const osmVectors = osmBuilding.coordinates.map(
        (point) =>
          new THREE.Vector2(
            point[0] * latScale + latStride,
            point[1] * lonScale + lonStride
          )
      );
      const polygonShape = new THREE.Shape(osmVectors);
      const extrudedGeometry = new THREE.ExtrudeGeometry(polygonShape, {
        depth: osmBuilding.height,
      });
      const buildingMesh = new THREE.Mesh(extrudedGeometry, MATERIAL);
      three.scene.add(buildingMesh);
    });
    const ambientLight = new THREE.AmbientLight(0x404040);
    three.scene.add(ambientLight);
    three.renderer.render(three.scene, three.camera);

    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene);
    };
  }, [osmBuildings, mapBounds]);

  useEffect(() => {
    if (
      mapBounds === undefined ||
      drawnPolygons === undefined ||
      drawnPolygons.length === 0
    ) {
      return;
    }

    const latMax = mapBounds.getNorthEast().lat;
    const latMin = mapBounds.getSouthWest().lat;
    const lonMin = mapBounds.getSouthWest().lng;
    const lonMax = mapBounds.getNorthEast().lng;

    const [latScale, latStride] = getNormalizationConstants(latMin, latMax);
    const [lonScale, lonStride] = getNormalizationConstants(lonMin, lonMax);

    drawnPolygons.forEach((polygonWithHeight) => {
      const vectors = polygonWithHeight.polygon.geometry.coordinates[0].map(
        (point) =>
          new THREE.Vector2(
            point[0] * latScale + latStride,
            point[1] * lonScale + lonStride
          )
      );
      const polygonShape = new THREE.Shape(vectors);
      const extrudedGeometry = new THREE.ExtrudeGeometry(polygonShape, {
        depth: polygonWithHeight.height,
      });
      const buildingMesh = new THREE.Mesh(extrudedGeometry, MATERIAL);
      three.scene.add(buildingMesh);

      let vectorsReversed = [];
      for (
        let i = polygonWithHeight.polygon.geometry.coordinates[0].length - 1;
        i >= 0;
        i--
      ) {
        const point = polygonWithHeight.polygon.geometry.coordinates[0][i];
        const newPoint = new THREE.Vector2(
          point[0] * latScale + latStride,
          point[1] * lonScale + lonStride
        );
        vectorsReversed.push(newPoint);
      }
      const polygonShapeReversed = new THREE.Shape(vectorsReversed);
      const extrudedGeometryReversed = new THREE.ExtrudeGeometry(
        polygonShapeReversed,
        {
          depth: polygonWithHeight.height,
        }
      );
      const buildingMeshReversed = new THREE.Mesh(
        extrudedGeometryReversed,
        MATERIAL
      );
      three.scene.add(buildingMeshReversed);

      if (polygonWithHeight.height > cameraHeight) {
        cameraHeight = polygonWithHeight.height + 15;
        three.camera.position.z = cameraHeight;
      }
    });
    const ambientLight = new THREE.AmbientLight(0x404040);
    three.scene.add(ambientLight);
    three.renderer.render(three.scene, three.camera);
    three.camera.position.z = cameraHeight;

    return function cleanupScene() {
      cleanupMeshesFromScene(three.scene);
    };
  }, [drawnPolygons, mapBounds]);

  useEffect(() => {
    const canvas = ref.current!;
    const orbit = new OrbitControls(three.camera, canvas);
    let animationId: number;
    function animate() {
      animationId = requestAnimationFrame(animate);
      orbit.update();
      three.renderer.render(three.scene, three.camera);
    }
    canvas.addEventListener("mouseover", () => {
      animate();
    });
    canvas.addEventListener("mouseout", () => {
      cancelAnimationFrame(animationId);
    });
  }, []);

  return (
    <Page>
      <canvas ref={ref} style={{ width: "100%", height: CANVAS_HEIGHT }} />
    </Page>
  );
}

export default MeshPage;
