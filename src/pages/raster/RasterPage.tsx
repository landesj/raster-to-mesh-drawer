import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DrawingCanvas } from "./drawingCanvas/DrawingCanvas";
import { fetchOsmBuildings } from "../../fetch/fetchOsm";
import {
  OsmBuildings,
  RasterImport,
  SetGroundPoint,
} from "./LeafletComponents";
import { Page } from "../style";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  DrawnLinesState,
  DrawnPolygonsState,
  GeoTiffState,
  GroundPointListeningState,
  OsmBuildingsState,
  ProjectSetupState,
  RasterState,
  ShowOsmBuildingsState,
} from "./state";
import { RasterNavbar } from "./Navbar";
import { MeshBoundsState } from "../state";
import { LineType } from "../../assets/Line";

export const CANVAS_HEIGHT = "90vh";
const workerUrl = new URL("./drawingCanvas/cycleWorker.ts", import.meta.url)
  .href;
const worker = new Worker(workerUrl, { type: "module" });

type PolygonIdentificationRequest = {
  drawnLines: LineType[];
  georaster: {
    values: any;
    pixelHeight: number;
    pixelWidth: number;
    noDataValue: number;
    xmin: number;
    ymax: number;
  };
};

type Request = {
  ongoingRequest: boolean;
  nextRequest?: PolygonIdentificationRequest;
};

export function RasterPage() {
  const isGroundPointListening = useRecoilValue(GroundPointListeningState);
  const rasterState = useRecoilValue(RasterState);
  const [osmBuildings, setOsmBuildings] = useRecoilState(OsmBuildingsState);
  const mapBounds = useRecoilValue(MeshBoundsState);
  const [showRaster, setShowRaster] = useState<boolean>(true);
  const isProjectSetup = useRecoilValue(ProjectSetupState);
  const drawnLines = useRecoilValue(DrawnLinesState);
  const georaster = useRecoilValue(GeoTiffState);
  const showOsmBuildings = useRecoilValue(ShowOsmBuildingsState);
  const setDrawnPolygonsState = useSetRecoilState(DrawnPolygonsState);
  const [request, setRequest] = useState<Request>({ ongoingRequest: false });

  useEffect(() => {
    worker.onmessage = (event) => {
      setDrawnPolygonsState(event.data.polygons);
    };
    setRequest((prev) => {
      return { ...prev, ongoingRequest: false };
    });
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    // Send a message to the worker
    if (!georaster) return;
    const request = {
      drawnLines,
      georaster: {
        values: georaster.values,
        pixelHeight: georaster.pixelHeight,
        pixelWidth: georaster.pixelWidth,
        noDataValue: georaster.noDataValue,
        xmin: georaster.xmin,
        ymax: georaster.ymax,
      },
    };
    setRequest((prev) => {
      return { ...prev, nextRequest: request };
    });
  }, [drawnLines, georaster]);

  useEffect(() => {
    if (!request.ongoingRequest && request.nextRequest)
      worker.postMessage(request.nextRequest);
  }, [request]);

  useEffect(() => {
    if (mapBounds === undefined) return;
    fetchOsmBuildings(mapBounds.bounds, setOsmBuildings);
  }, [mapBounds]);

  const changeShowRasterState = () => {
    setShowRaster(!showRaster);
  };
  const showRasterText = showRaster ? "Hide Raster" : "Show Raster";

  return (
    <Page>
      {isProjectSetup && (
        <RasterNavbar
          changeShowRasterState={changeShowRasterState}
          rasterState={rasterState}
          showRasterText={showRasterText}
        />
      )}
      <MapContainer
        center={[0, 0]}
        zoom={20}
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
        {!isGroundPointListening && <DrawingCanvas />}
        <RasterImport rasterArrayBuffer={rasterState} showRaster={showRaster} />
        <SetGroundPoint />
        {osmBuildings.length !== 0 && showOsmBuildings && (
          <OsmBuildings buildings={osmBuildings} />
        )}
      </MapContainer>
    </Page>
  );
}
