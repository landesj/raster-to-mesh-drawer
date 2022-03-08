import { useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DrawingCanvas } from "./DrawingCanvas";
import { fetchOsmBuildings } from "../../fetch/fetchOsm";
import { OsmBuildings, RasterImport, SetMapBounds } from "./LeafletComponents";
import { Button, Input, Label, Page } from "../style";
import { useRecoilState } from "recoil";
import {
  BoundsState,
  OsmBuildingsLatLngState,
  OsmBuildingsState,
} from "./state";

export const CANVAS_HEIGHT = "90vh";

export function RasterPage() {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rasterState, setRasterState] = useState<ArrayBuffer | null>(null);
  const [osmBuildings, setOsmBuildings] = useRecoilState(OsmBuildingsState);
  const [mapBounds, setMapBounds] = useRecoilState(BoundsState);
  const [showRaster, setShowRaster] = useState<boolean>(true);

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
    fetchOsmBuildings(mapBounds, setOsmBuildings);
  }, [mapBounds, setOsmBuildings]);

  const changeShowRasterState = () => {
    setShowRaster(!showRaster);
  };

  const drawingButtonText = isDrawing ? "Stop Drawing" : "Start Drawing";
  const showRasterText = showRaster ? "Hide Raster" : "Show Raster";
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
          <RasterImport
            rasterArrayBuffer={rasterState}
            showRaster={showRaster}
          />
          <SetMapBounds setBounds={setMapBounds} />
          {osmBuildings.length !== 0 && (
            <OsmBuildings buildings={osmBuildings} />
          )}
        </MapContainer>
      </div>
      <div>
        <Button onClick={changeIsDrawing}>{drawingButtonText}</Button>
        <Button onClick={orderOSMBuildings}>Order OSM Buildings</Button>
        {rasterState !== null && (
          <Button onClick={changeShowRasterState}>{showRasterText}</Button>
        )}
        <Label>Import GeoTiff File</Label>
        <Input
          id="tif_input"
          onChange={(event) => onChange(event.target.files)}
        />
      </div>
    </Page>
  );
}
