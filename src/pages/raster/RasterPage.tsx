import { useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DrawingCanvas } from "./drawingCanvas/DrawingCanvas";
import { fetchOsmBuildings } from "../../fetch/fetchOsm";
import {
  OsmBuildings,
  RasterImport,
  SetGroundPoint,
  SetMapBounds,
} from "./LeafletComponents";
import { Input, Label, Page } from "../style";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  GroundPointListeningState,
  LeafletBoundsState,
  OsmBuildingsState,
} from "./state";
import { RasterNavbar } from "./Navbar";

export const CANVAS_HEIGHT = "90vh";

export function RasterPage() {
  const isGroundPointListening = useRecoilValue(GroundPointListeningState);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rasterState, setRasterState] = useState<ArrayBuffer | null>(null);
  const [osmBuildings, setOsmBuildings] = useRecoilState(OsmBuildingsState);
  const [mapBounds, setMapBounds] = useRecoilState(LeafletBoundsState);
  const [showRaster, setShowRaster] = useState<boolean>(true);

  const onInputChange = (files: FileList | null) => {
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

  const orderOsmBuildings = useCallback(() => {
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
      <RasterNavbar
        changeIsDrawing={changeIsDrawing}
        orderOsmBuildings={orderOsmBuildings}
        changeShowRasterState={changeShowRasterState}
        rasterState={rasterState}
        drawingButtonText={drawingButtonText}
        showRasterText={showRasterText}
      />
      <MapContainer
        center={[51.505, -0.09]}
        zoom={15}
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
        {isDrawing && !isGroundPointListening && <DrawingCanvas />}
        <RasterImport rasterArrayBuffer={rasterState} showRaster={showRaster} />
        <SetMapBounds setBounds={setMapBounds} />
        <SetGroundPoint />
        {osmBuildings.length !== 0 && <OsmBuildings buildings={osmBuildings} />}
      </MapContainer>
      <Input
        id="tif_input"
        onChange={(event) => onInputChange(event.target.files)}
      />
      <Label>Import GeoTiff File</Label>
    </Page>
  );
}
