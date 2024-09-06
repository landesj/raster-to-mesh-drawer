import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CANVAS_HEIGHT } from "../raster/RasterPage";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Page } from "../style";
import { DrawnBuildings } from "./components/DrawnBuildings";
import { Terrain } from "./components/Terrain";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  GroundPointState,
  ProjectSetupState,
  ShowOsmState,
} from "../raster/state";
import { Vegetation } from "./components/Vegetation";
import { Roads } from "./components/Roads";
import { Eye, EyeOff } from "lucide-react";

export const canvasSize = 1000;
export const MATERIAL = new THREE.MeshLambertMaterial({ color: "#ffffff" });

export let three = {
  renderer: new THREE.WebGLRenderer(),
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(),
};

export let orbitControls = new OrbitControls(
  new THREE.PerspectiveCamera(),
  new THREE.WebGLRenderer().domElement
);

export function cleanupMeshesFromScene(scene: THREE.Scene, name: string) {
  for (let i = scene.children.length - 1; i >= 0; i--) {
    if (scene.children[i].name === name) {
      if (scene.children[i].type === "Mesh") {
        const mesh: THREE.Mesh = scene.children[i] as THREE.Mesh;
        mesh.geometry.dispose();
        // TODO: How to dispose of material
        scene.remove(mesh);
      }
    }
  }
  three.renderer.render(three.scene, three.camera);
}

function BottomBar() {
  const isProjectSetup = useRecoilValue(ProjectSetupState);
  const groundHeight = useRecoilValue(GroundPointState);
  const [showOsm, setShowOsm] = useRecoilState(ShowOsmState);
  const groundHeightText = `Ground elevation is: ${groundHeight.toFixed(2)}`;
  if (!isProjectSetup) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "3px",
      }}
    >
      <p>{groundHeightText}</p>
      {showOsm ? (
        <div onClick={() => setShowOsm(!showOsm)} style={{ cursor: "pointer" }}>
          <EyeOff />
        </div>
      ) : (
        <div onClick={() => setShowOsm(!showOsm)} style={{ cursor: "pointer" }}>
          <Eye />
        </div>
      )}
    </div>
  );
}

function MeshPage() {
  const ref = useRef<HTMLCanvasElement>(null);

  const pointLight = useMemo(() => {
    return new THREE.PointLight(0xffffff, 1);
  }, []);

  useEffect(() => {
    // Set up canvas
    const canvas = ref.current!;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight;

    // Create scene, add lighting
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#F8F8FF");

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
    camera.position.z = 300;

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
    const canvas = ref.current!;
    orbitControls = new OrbitControls(three.camera, canvas);
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
      orbitControls.update();
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
      <canvas ref={ref} style={{ width: "100%", height: CANVAS_HEIGHT }} />
      <DrawnBuildings />
      <Terrain />
      <Vegetation />
      <Roads />
      <BottomBar />
    </Page>
  );
}

export default MeshPage;
