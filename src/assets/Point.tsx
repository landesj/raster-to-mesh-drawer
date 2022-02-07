import { SVGOverlay, useMap } from "react-leaflet";

export type PointType = { x: number; y: number };
type Props = { height: string; width: string; point: PointType };

export function Point(props: Props) {
  const leafletMap = useMap();
  const { x, y } = props.point;
  return (
    <SVGOverlay bounds={leafletMap.getBounds()}>
      <circle cx={x} cy={y} r="4" stroke="#0000FF" fill="#0000FF"></circle>
    </SVGOverlay>
  );
}
