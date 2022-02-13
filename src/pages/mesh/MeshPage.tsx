import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import * as THREE from "three";
import { Camera } from "three";
import { CANVAS_HEIGHT } from "../raster/RasterPage";
import { OsmBoundsState, OsmBuildingsState } from "../raster/state";

export const canvasSize = 1000;
export const MATERIAL = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

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

function MeshPage() {
  const ref = useRef<HTMLCanvasElement>(null);
  const osmBuildings = useRecoilValue(OsmBuildingsState);
  const osmBounds = useRecoilValue(OsmBoundsState);

  useEffect(() => {
    const canvas = ref.current!;
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      10000
    );
    camera.position.z = 40;
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
      const osmVectors = osmBuilding.map(
        (point) =>
          new THREE.Vector2(
            point[0] * latScale + latStride,
            point[1] * lonScale + lonStride
          )
      );
      const polygonShape = new THREE.Shape(osmVectors);
      const extrudedGeometry = new THREE.ExtrudeGeometry(polygonShape, {
        depth: 5,
      });
      const buildingMesh = new THREE.Mesh(extrudedGeometry, MATERIAL);
      three.scene.add(buildingMesh);
    });
    three.renderer.render(three.scene, three.camera);
  }, [osmBuildings, osmBounds]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
      <h2>This is the Mesh Page.</h2>
      <canvas ref={ref} style={{ width: "100%", height: CANVAS_HEIGHT }} />
    </div>
  );
}

export default MeshPage;
