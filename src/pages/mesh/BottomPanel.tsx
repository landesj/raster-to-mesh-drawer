import { Button } from "../style";
import { handleMeshExport, TurfPolygonWithHeight } from "./meshExport";

export type Props = {
  groundHeight: number;
  drawnBuildings: TurfPolygonWithHeight[];
};

export function BottomPanel(props: Props) {
  const groundHeightText = `Ground elevation is: ${props.groundHeight.toFixed(
    2
  )}`;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: "5px",
      }}
    >
      <p>{groundHeightText}</p>
      {props.drawnBuildings.length > 0 && (
        <Button
          onClick={() =>
            handleMeshExport(props.drawnBuildings, props.groundHeight)
          }
        >
          Export Mesh
        </Button>
      )}
    </div>
  );
}
