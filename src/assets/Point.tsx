import { Circle } from "react-leaflet";

export type PointType = { lat: number; lng: number };
type Props = { point: PointType };

export function Point(props: Props) {
  const { lat, lng } = props.point;
  return (
    <Circle
      center={[lat, lng]}
      pathOptions={{ fillColor: "#0000FF" }}
      radius={1}
    />
  );
}
