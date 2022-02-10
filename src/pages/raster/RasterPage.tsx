import { useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import styled from "styled-components";
import "leaflet/dist/leaflet.css";
import { DrawingCanvas } from "./DrawingPage";
import { fetchOSMBuildings, BuildingPolygon } from "../../fetch/fetchOsm";
import { LatLngBounds } from "leaflet";
import { OsmBuildings, RasterImport, SetMapBounds } from "./LeafletComponents";

const CANVAS_HEIGHT = "700px";
const CANVAS_WIDTH = "700px";

const Page = styled.div`
  display: flex;
  flex-direction: column;
`;

export function RasterPage() {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rasterState, setRasterState] = useState<ArrayBuffer | null>(null);
  const [mapBounds, setMapBounds] = useState<LatLngBounds>();
  const [osmBuildings, setOsmBuildings] = useState<BuildingPolygon[]>([]);

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
  }, [mapBounds, setOsmBuildings]);

  const drawingButtonText = isDrawing ? "Stop Drawing" : "Start Drawing";
  return (
    <Page>
      <h2>This is the Raster page.</h2>
      <input
        type="file"
        accept=".tif,.tiff"
        onChange={(event) => onChange(event.target.files)}
      />
      <button style={{ width: "150px" }} onClick={changeIsDrawing}>
        {drawingButtonText}
      </button>
      <button style={{ width: "150px" }} onClick={orderOSMBuildings}>
        Order OSM Buildings
      </button>
      <div style={{ padding: "10px" }}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: CANVAS_HEIGHT, width: CANVAS_WIDTH }}
          minZoom={1}
          maxZoom={30}
          maxNativeZoom={25}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={30}
          />
          {isDrawing && (
            <DrawingCanvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} />
          )}
          <RasterImport rasterArrayBuffer={rasterState} />
          <SetMapBounds setBounds={setMapBounds} />
          {osmBuildings.length !== 0 && (
            <OsmBuildings buildings={osmBuildings} />
          )}
        </MapContainer>
      </div>
    </Page>
  );
}
