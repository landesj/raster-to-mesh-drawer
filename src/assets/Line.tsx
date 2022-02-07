import { SVGOverlay, useMap } from "react-leaflet";

export type LineType = {
  xSrc: number;
  ySrc: number;
  xDst: number;
  yDst: number;
};

type Props = { height: string; width: string; line: LineType };

export function Line(props: Props) {
  const leafletMap = useMap();
  const { xSrc, ySrc, xDst, yDst } = props.line;
  return (
    <SVGOverlay bounds={leafletMap.getBounds()}>
      <line
        x1={xSrc}
        y1={ySrc}
        x2={xDst}
        y2={yDst}
        stroke="black"
        strokeWidth="3"
      />
    </SVGOverlay>
  );
}
