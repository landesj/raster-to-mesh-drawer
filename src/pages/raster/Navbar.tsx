import { Button, Input, Label, Navbar } from "../style";

type Props = {
  changeIsDrawing: () => void;
  orderOsmBuildings: () => void;
  changeShowRasterState: () => void;
  onInputChange: (files: FileList | null) => void;
  rasterState: ArrayBuffer | null;
  drawingButtonText: string;
  showRasterText: string;
};

export function RasterNavbar({
  changeIsDrawing,
  orderOsmBuildings,
  changeShowRasterState,
  onInputChange,
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
      <Label>Import GeoTiff File</Label>
      <Input
        id="tif_input"
        onChange={(event) => onInputChange(event.target.files)}
      />
    </Navbar>
  );
}
