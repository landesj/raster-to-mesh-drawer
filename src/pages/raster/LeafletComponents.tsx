import GeoRasterLayer from "georaster-layer-for-leaflet";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { Polygon, useMap, useMapEvent } from "react-leaflet";
import { v4 as uuidv4 } from "uuid";
import parseGeoraster from "georaster";
import {
  SetterOrUpdater,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import {
  GeoTiffState,
  GroundPointListeningState,
  GroundPointState,
} from "./state";
import { getMapBounds, MapBounds } from "../../mapUtils";
import { MeshBoundsState } from "../state";
import * as turf from "turf";
import { Coordinates } from "./types";

type ImportProps = {
  rasterArrayBuffer: ArrayBuffer | null;
  showRaster: boolean;
};

type SetBoundsProps = {
  setBounds: SetterOrUpdater<MapBounds | undefined>;
};

type OsmProps = {
  buildings: Coordinates[];
};

export function SetMapBounds({ setBounds }: SetBoundsProps) {
  const setBoundsDebounced = debounce(setBounds, 100);
  const leafletMap = useMap();
  const leafletBounds = getMapBounds(leafletMap.getBounds());
  useMapEvent("move", () => setBoundsDebounced(leafletBounds));
  return <></>;
}

export function RasterImport({ rasterArrayBuffer, showRaster }: ImportProps) {
  const leafletMap = useMap();
  const setGeoTiffState = useSetRecoilState(GeoTiffState);
  const setMapBoundsState = useSetRecoilState(MeshBoundsState);
  const [geoRasterLayerShown, setGeoRasterLayerShown] =
    useState<any>(undefined);

  useEffect(() => {
    if (!rasterArrayBuffer) return;
    parseGeoraster(rasterArrayBuffer).then((georaster: any) => {
      const geoTiff = new GeoRasterLayer({
        georaster: georaster,
        opacity: 0.95,
      });
      const geoTiffBounds = geoTiff.getBounds();
      leafletMap.addLayer(geoTiff);
      leafletMap.fitBounds(geoTiffBounds);

      const mapBounds = getMapBounds(geoTiffBounds);

      setMapBoundsState({ bounds: mapBounds, type: "import" });
      setGeoTiffState(georaster);
      setGeoRasterLayerShown(geoTiff);
    });
  }, [rasterArrayBuffer, leafletMap, setGeoTiffState, setMapBoundsState]);

  useEffect(() => {
    if (!showRaster && geoRasterLayerShown !== undefined) {
      leafletMap.removeLayer(geoRasterLayerShown);
    }
    if (showRaster && geoRasterLayerShown !== undefined) {
      leafletMap.addLayer(geoRasterLayerShown);
    }
  }, [showRaster, geoRasterLayerShown, leafletMap]);
  return <></>;
}

export function OsmBuildings({ buildings }: OsmProps) {
  const leafletPolygons = buildings.map((building) => {
    return <Polygon key={uuidv4()} positions={building} />;
  });
  return <>{leafletPolygons}</>;
}

export function SetGroundPoint() {
  const georaster = useRecoilValue(GeoTiffState);
  const setGroundHeight = useSetRecoilState(GroundPointState);
  const [groundHeightListening, setGroundHeightListening] = useRecoilState(
    GroundPointListeningState
  );
  useMapEvent("click", (event) => {
    if (georaster === undefined || !groundHeightListening) return;
    const groundPoint = turf.point([event.latlng.lat, event.latlng.lng]);
    let minDistance: number = Infinity;
    let groundHeight: number = Infinity;
    for (
      let x = georaster.xmin;
      x < georaster.xmax;
      x += georaster.pixelWidth
    ) {
      for (
        let y = georaster.ymin;
        y < georaster.ymax;
        y += georaster.pixelHeight
      ) {
        const newPoint = turf.point([y, x]);
        if (turf.distance(newPoint, groundPoint) < minDistance) {
          const xPixelIndex = Math.round(
            (x - georaster.xmin) / georaster.pixelWidth
          );
          const yPixelIndex = Math.round(
            (georaster.ymax - y) / georaster.pixelHeight
          );
          if (
            yPixelIndex >= georaster.values[0].length ||
            xPixelIndex >= georaster.values[0][0].length
          )
            continue;
          groundHeight = georaster.values[0][yPixelIndex][xPixelIndex];
          minDistance = turf.distance(newPoint, groundPoint);
        }
      }
    }
    setGroundHeight(groundHeight);
    setGroundHeightListening(false);
  });
  return <></>;
}
