import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import styled from "styled-components";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { DrawingCanvas } from "./DrawingPage";

const CANVAS_HEIGHT = "700px";
const CANVAS_WIDTH = "700px";

const Page = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = { rasterArrayBuffer: ArrayBuffer | null };

function RasterImport(props: Props) {
  const leafletMap = useMap();

  if (!props.rasterArrayBuffer) return <></>;

  parseGeoraster(props.rasterArrayBuffer).then((georaster: any) => {
    const geoTiff = new GeoRasterLayer({ georaster: georaster });
    leafletMap.addLayer(geoTiff);
    leafletMap.fitBounds(geoTiff.getBounds());
  });
  return <></>;
}

export function RasterPage() {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rasterState, setRasterState] = useState<ArrayBuffer | null>(null);

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
      <div style={{ padding: "10px" }}>
        {isDrawing && (
          <DrawingCanvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} />
        )}
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
          <RasterImport rasterArrayBuffer={rasterState} />
        </MapContainer>
      </div>
    </Page>
  );
}
