export type PointType = { x: number; y: number };
type Props = { height: string; width: string; point: PointType };

export function Point(props: Props) {
  const { x, y } = props.point;
  return (
    <svg
      height={props.height}
      width={props.width}
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "fixed", zIndex: 2 }}
    >
      <circle cx={x} cy={y} r="4" stroke="#0000FF" fill="#0000FF"></circle>
    </svg>
  );
}
