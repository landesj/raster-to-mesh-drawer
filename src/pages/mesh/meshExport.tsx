import { TurfPolygon } from "../raster/drawingCanvas/types";
import { saveAs } from "file-saver";

export type TurfPolygonWithHeight = {
  polygon: TurfPolygon;
  height: number;
};

function _addSurfaceFace(vertices: number[]) {
  let face = "f";
  vertices.forEach((vertexNumber) => {
    face = face + ` ${vertexNumber}`;
  });
  face = face + "\n";
  return face;
}

function _addFacadeFaces(groundVertices: number[], roofVertices: number[]) {
  let facadeFaces = "";
  for (let index = 0; index < groundVertices.length - 1; index += 1) {
    let facadeFace = "f";
    facadeFace = facadeFace + ` ${groundVertices[index]}`;
    facadeFace = facadeFace + ` ${roofVertices[index]}`;
    facadeFace = facadeFace + ` ${roofVertices[index + 1]}`;
    facadeFace = facadeFace + ` ${groundVertices[index + 1]}`;
    facadeFaces = facadeFaces + facadeFace + "\n";
  }
  let facadeFace = "f";
  facadeFace = facadeFace + ` ${groundVertices[0]}`;
  facadeFace = facadeFace + ` ${roofVertices[0]}`;
  facadeFace = facadeFace + ` ${roofVertices[roofVertices.length - 1]}`;
  facadeFace = facadeFace + ` ${groundVertices[groundVertices.length - 1]}`;
  facadeFaces = facadeFaces + facadeFace + "\n";
  return facadeFaces;
}

export function handleMeshExport(
  drawnBuildings: TurfPolygonWithHeight[],
  groundHeight: number
) {
  let objString = "";
  let numVertices = 1;
  drawnBuildings.forEach((drawnBuilding) => {
    let groundVertices: number[] = [];
    let roofVertices: number[] = [];
    drawnBuilding.polygon.geometry.coordinates[0].forEach((coord) => {
      const vGround = `v ${coord[0]} ${coord[1]} ${groundHeight}\n`;
      groundVertices.push(numVertices);
      numVertices += 1;
      const vRoof = `v ${coord[0]} ${coord[1]} ${drawnBuilding.height}\n`;
      roofVertices.push(numVertices);
      numVertices += 1;
      objString = objString + vGround + vRoof;
    });
    const groundFace = _addSurfaceFace(groundVertices);
    const roofFace = _addSurfaceFace(roofVertices);
    const facadeFaces = _addFacadeFaces(groundVertices, roofVertices);
    objString = objString + groundFace + roofFace + facadeFaces;
  });
  const blob = new Blob([objString], { type: "text/plain;charset=utf-8" });
  saveAs(blob, "buildings.obj");
}
