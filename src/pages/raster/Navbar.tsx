import { Button, Navbar } from "../style";

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
  return (
    <Navbar>
      <Button onClick={changeIsDrawing}>{drawingButtonText}</Button>
      <Button onClick={orderOsmBuildings}>Order OSM Buildings</Button>
      {rasterState !== null && (
        <Button onClick={changeShowRasterState}>{showRasterText}</Button>
      )}
    </Navbar>
  );
}
