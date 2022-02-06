import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import styled from "styled-components";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { DrawingCanvas } from "./DrawingPage";

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
  return (
    <Page>
      <h2>This is the Raster page.</h2>
      <input
        type="file"
        accept=".tif,.tiff"
        onChange={(event) => onChange(event.target.files)}
      />
      <div style={{ padding: "10px" }}>
        <DrawingCanvas />
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: "800px", width: "600px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RasterImport rasterArrayBuffer={rasterState} />
        </MapContainer>
      </div>
    </Page>
  );
}
