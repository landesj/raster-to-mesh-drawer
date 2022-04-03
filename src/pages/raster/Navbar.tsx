import { useRecoilState, useRecoilValue } from "recoil";
import { Button, Navbar } from "../style";
import { GroundPointListeningState, GroundPointState } from "./state";

type Props = {
  changeIsDrawing: () => void;
  orderOsmBuildings: () => void;
  changeShowRasterState: () => void;
  rasterState: ArrayBuffer | null;
  drawingButtonText: string;
  showRasterText: string;
};

export function RasterNavbar({
  changeIsDrawing,
  orderOsmBuildings,
  changeShowRasterState,
  rasterState,
  drawingButtonText,
  showRasterText,
}: Props) {
  const [groundPointListening, setGroundPointListening] = useRecoilState(
    GroundPointListeningState
  );
  const groundPoint = useRecoilValue(GroundPointState);

  const onClickGroundPointListening = () => {
    setGroundPointListening(!groundPointListening);
  };

  let groundPointText = "Pick Ground Point";
  if (groundPointListening) {
    groundPointText = "Unpick Ground Point";
  } else if (groundPoint) {
    groundPointText = "Update Ground Point";
  }

  return (
    <Navbar>
      <Button onClick={changeIsDrawing}>{drawingButtonText}</Button>
      <Button onClick={orderOsmBuildings}>Order OSM Buildings</Button>
      {rasterState !== null && (
        <Button onClick={onClickGroundPointListening}>{groundPointText}</Button>
      )}
      {rasterState !== null && (
        <Button onClick={changeShowRasterState}>{showRasterText}</Button>
      )}
    </Navbar>
  );
}
