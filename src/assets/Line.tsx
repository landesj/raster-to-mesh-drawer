export type LineType = {
  xSrc: number;
  ySrc: number;
  xDst: number;
  yDst: number;
};

type Props = { height: string; width: string; line: LineType };

export function Line(props: Props) {
  const { xSrc, ySrc, xDst, yDst } = props.line;
  return (
    <svg
      height={props.height}
      width={props.width}
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "fixed", zIndex: 1 }}
    >
      <line
        x1={xSrc}
        y1={ySrc}
        x2={xDst}
        y2={yDst}
        stroke="black"
        strokeWidth="3"
      />
    </svg>
  );
}
