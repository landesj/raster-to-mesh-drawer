import { useEffect, useRef } from "react";
import * as THREE from "three";

export const canvasSize = 1000;

function MeshPage() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      10000
    );
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({
      canvas,
    });

    renderer.render(scene, camera);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
      <h2>This is the Mesh Page.</h2>
      <canvas ref={ref} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default MeshPage;
