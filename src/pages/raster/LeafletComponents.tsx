import GeoRasterLayer from "georaster-layer-for-leaflet";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { Polygon, useMap, useMapEvent } from "react-leaflet";
import { v4 as uuidv4 } from "uuid";
import parseGeoraster from "georaster";
import { SetterOrUpdater, useSetRecoilState } from "recoil";
import { GeoTiffState } from "./state";
import { Geometry } from "./types";
import { getMapBounds, MapBounds } from "../../mapUtils";
import { MeshBoundsState } from "../state";

type ImportProps = {
  rasterArrayBuffer: ArrayBuffer | null;
  showRaster: boolean;
};

type SetBoundsProps = {
  setBounds: SetterOrUpdater<MapBounds | undefined>;
};

type OsmProps = {
  buildings: Geometry[];
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
    return <Polygon key={uuidv4()} positions={building.coordinates} />;
  });
  return <>{leafletPolygons}</>;
}
