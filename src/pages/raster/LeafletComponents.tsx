import GeoRasterLayer from "georaster-layer-for-leaflet";
import { LatLngBounds } from "leaflet";
import { debounce } from "lodash";
import { useCallback, useEffect } from "react";
import { Polygon, useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import { BuildingPolygon } from "../../fetch/fetchOsm";

type ImportProps = { rasterArrayBuffer: ArrayBuffer | null };

type SetBoundsProps = {
  setBounds: React.Dispatch<React.SetStateAction<LatLngBounds | undefined>>;
};

type OsmProps = {
  buildings: BuildingPolygon[];
};

export function SetMapBounds({ setBounds }: SetBoundsProps) {
  const setBoundsDebounced = debounce(setBounds, 100);
  const leafletMap = useMap();
  const onMove = useCallback(() => {
    setBoundsDebounced(leafletMap.getBounds());
  }, [leafletMap]);

  useEffect(() => {
    leafletMap.on("move", onMove);
  }, [leafletMap, onMove]);
  return <></>;
}

export function RasterImport({ rasterArrayBuffer }: ImportProps) {
  const leafletMap = useMap();

  if (!rasterArrayBuffer) return <></>;

  parseGeoraster(rasterArrayBuffer).then((georaster: any) => {
    const geoTiff = new GeoRasterLayer({ georaster: georaster });
    leafletMap.addLayer(geoTiff);
    leafletMap.fitBounds(geoTiff.getBounds());
  });
  return <></>;
}

export function OsmBuildings({ buildings }: OsmProps) {
  const leafletPolygons = buildings.map((building) => {
    return <Polygon positions={building} />;
  });
  return <>{leafletPolygons}</>;
}
