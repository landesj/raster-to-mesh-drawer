import { useCallback, useEffect, useState } from "react";
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
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  DrawnLinesState,
  DrawnPolygonsState,
  GeoTiffState,
  GroundPointListeningState,
  LeafletBoundsState,
  OsmBuildingsState,
  ProjectSetupState,
  RasterState,
} from "./state";
import { RasterNavbar } from "./Navbar";

export const CANVAS_HEIGHT = "90vh";
const workerUrl = new URL("./drawingCanvas/cycleWorker.ts", import.meta.url)
  .href;

export function RasterPage() {
  const isGroundPointListening = useRecoilValue(GroundPointListeningState);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const rasterState = useRecoilValue(RasterState);
  const [osmBuildings, setOsmBuildings] = useRecoilState(OsmBuildingsState);
  const [mapBounds, setMapBounds] = useRecoilState(LeafletBoundsState);
  const [showRaster, setShowRaster] = useState<boolean>(true);
  const isProjectSetup = useRecoilValue(ProjectSetupState);
  const drawnLines = useRecoilValue(DrawnLinesState);
  const georaster = useRecoilValue(GeoTiffState);
  const setDrawnPolygonsState = useSetRecoilState(DrawnPolygonsState);

  useEffect(() => {
    const worker = new Worker(workerUrl, { type: "module" });

    // Define the function to handle messages from the worker
    worker.onmessage = (event) => {
      setDrawnPolygonsState(event.data.polygons);
    };

    // Send a message to the worker
    if (georaster !== undefined) {
      worker.postMessage({
        drawnLines,
        georaster: {
          values: georaster.values,
          pixelHeight: georaster.pixelHeight,
          pixelWidth: georaster.pixelHeight,
          noDataValue: georaster.noDataValue,
          xmin: georaster.xmin,
          ymax: georaster.ymax,
        },
      });
    }

    // Clean up the worker when the component unmounts
    return () => {
      worker.terminate();
    };
  }, [drawnLines, georaster, setDrawnPolygonsState]);

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
      {isProjectSetup && (
        <RasterNavbar
          changeIsDrawing={changeIsDrawing}
          orderOsmBuildings={orderOsmBuildings}
          changeShowRasterState={changeShowRasterState}
          rasterState={rasterState}
          drawingButtonText={drawingButtonText}
          showRasterText={showRasterText}
        />
      )}
      <MapContainer
        center={[51.505, -0.09]}
        zoom={15}
        style={{ height: CANVAS_HEIGHT, width: "100%", cursor: "pointer" }}
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
    </Page>
  );
}
