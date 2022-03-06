import { Circle } from "react-leaflet";

export type PointType = { lat: number; lng: number };
type Props = { key: string; point: PointType };

export function MapPoint(props: Props) {
  const { lat, lng } = props.point;
  return (
    <Circle
      key={props.key}
      center={[lat, lng]}
      pathOptions={{ fillColor: "#0000FF" }}
      radius={1}
    />
  );
}
