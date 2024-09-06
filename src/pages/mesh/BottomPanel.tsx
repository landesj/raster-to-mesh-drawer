import { Button } from "@radix-ui/themes";
import { handleMeshExport } from "./meshExport";
import { DrawnPolygonsState, GroundPointState } from "../raster/state";
import { useRecoilValue } from "recoil";

export function BottomPanel() {
  const drawnBuildings = useRecoilValue(DrawnPolygonsState);
  const groundHeight = useRecoilValue(GroundPointState);
  return (
    <div
      style={{
        paddingTop: "5px",
      }}
    >
      {drawnBuildings.length > 0 && (
        <Button onClick={() => handleMeshExport(drawnBuildings, groundHeight)}>
          Export Mesh
        </Button>
      )}
    </div>
  );
}
