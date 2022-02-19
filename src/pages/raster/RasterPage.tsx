import { useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DrawingCanvas } from "./DrawingCanvas";
import { fetchOSMBuildings } from "../../fetch/fetchOsm";
import { LatLngBounds } from "leaflet";
import { OsmBuildings, RasterImport, SetMapBounds } from "./LeafletComponents";
import { Button, Input, Label, Page } from "../style";
import { useRecoilState, useSetRecoilState } from "recoil";
import { OsmBoundsState, OsmBuildingsState } from "./state";

export const CANVAS_HEIGHT = "90vh";

export function RasterPage() {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rasterState, setRasterState] = useState<ArrayBuffer | null>(null);
  const [mapBounds, setMapBounds] = useState<LatLngBounds>();
  const [osmBuildings, setOsmBuildings] = useRecoilState(OsmBuildingsState);
  const setOsmBounds = useSetRecoilState(OsmBoundsState);

  const onChange = (files: FileList | null) => {
    if (files !== null) {
      const file = files[0];
      const reader = new FileReader();
      reader.onerror = () => {
        alert("Encountered an error when reading file.");
      };
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => {
        setRasterState(reader.result as ArrayBuffer);
      };
    }
  };

  const changeIsDrawing = () => {
    setIsDrawing(!isDrawing);
  };

  const orderOSMBuildings = useCallback(() => {
    if (mapBounds === undefined) {
      alert("Map bounds not set, cannot order OSM");
      return;
    }
    fetchOSMBuildings(mapBounds, setOsmBuildings);
    // Unsure if this will run if above function was unsuccessful?
    setOsmBounds(mapBounds);
  }, [mapBounds, setOsmBuildings, setOsmBounds]);

  const drawingButtonText = isDrawing ? "Stop Drawing" : "Start Drawing";
  const cursorStyle = isDrawing ? "default" : "grab";
  return (
    <Page>
      <div style={{ padding: "10px" }}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: CANVAS_HEIGHT, width: "100%", cursor: "default" }}
          minZoom={1}
          maxZoom={25}
          maxNativeZoom={25}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={25}
          />
          {isDrawing && <DrawingCanvas />}
          <RasterImport rasterArrayBuffer={rasterState} />
          <SetMapBounds setBounds={setMapBounds} />
          {osmBuildings.length !== 0 && (
            <OsmBuildings buildings={osmBuildings} />
          )}
        </MapContainer>
      </div>
      <div>
        <Button onClick={changeIsDrawing}>{drawingButtonText}</Button>
        <Button onClick={orderOSMBuildings}>Order OSM Buildings</Button>
        <Label>Import GeoTiff File</Label>
        <Input
          id="tif_input"
          onChange={(event) => onChange(event.target.files)}
        />
      </div>
    </Page>
  );
}
