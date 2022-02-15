import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import * as THREE from "three";
import { CANVAS_HEIGHT } from "../raster/RasterPage";
import { OsmBoundsState, OsmBuildingsState } from "../raster/state";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
  const osmBounds = useRecoilValue(OsmBoundsState);

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
    camera.position.z = 40;

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
    if (osmBounds === undefined || osmBuildings.length === 1) {
      return;
    }

    const latMax = osmBounds.getNorthEast().lat;
    const latMin = osmBounds.getSouthWest().lat;
    const lonMin = osmBounds.getSouthWest().lng;
    const lonMax = osmBounds.getNorthEast().lng;

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
  }, [osmBuildings, osmBounds]);

  useEffect(() => {
    const canvas = ref.current!;
    const orbit = new OrbitControls(three.camera, canvas);
    function animate() {
      requestAnimationFrame(animate);
      orbit.update();
      three.renderer.render(three.scene, three.camera);
    }
    animate();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
      <h2>This is the Mesh Page.</h2>
      <canvas ref={ref} style={{ width: "100%", height: CANVAS_HEIGHT }} />
    </div>
  );
}

export default MeshPage;
