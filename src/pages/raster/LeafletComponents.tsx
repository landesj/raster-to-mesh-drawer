import GeoRasterLayer from "georaster-layer-for-leaflet";
import { LatLngBounds } from "leaflet";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { Polygon, useMap, useMapEvent } from "react-leaflet";
import { v4 as uuidv4 } from "uuid";
import parseGeoraster from "georaster";
import { useSetRecoilState } from "recoil";
import { GeoTiffState } from "./state";
import { Geometry } from "./types";

type ImportProps = {
  rasterArrayBuffer: ArrayBuffer | null;
  showRaster: boolean;
};

type SetBoundsProps = {
  setBounds: React.Dispatch<React.SetStateAction<LatLngBounds | undefined>>;
};

type OsmProps = {
  buildings: Geometry[];
};

export function SetMapBounds({ setBounds }: SetBoundsProps) {
  const setBoundsDebounced = debounce(setBounds, 100);
  const leafletMap = useMap();
  useMapEvent("move", () => setBoundsDebounced(leafletMap.getBounds()));
  return <></>;
}

export function RasterImport({ rasterArrayBuffer, showRaster }: ImportProps) {
  const leafletMap = useMap();
  const setGeoTiffState = useSetRecoilState(GeoTiffState);
  const [geoRasterLayerShown, setGeoRasterLayerShown] =
    useState<any>(undefined);

  useEffect(() => {
    if (!rasterArrayBuffer) return;
    parseGeoraster(rasterArrayBuffer).then((georaster: any) => {
      const geoTiff = new GeoRasterLayer({
        georaster: georaster,
        opacity: 0.95,
      });
      leafletMap.addLayer(geoTiff);
      leafletMap.fitBounds(geoTiff.getBounds());
      setGeoTiffState(georaster);
      setGeoRasterLayerShown(geoTiff);
    });
  }, [rasterArrayBuffer, leafletMap, setGeoTiffState]);

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
    return <Polygon key={uuidv4()} positions={building.coordinates} />;
  });
  return <>{leafletPolygons}</>;
}
