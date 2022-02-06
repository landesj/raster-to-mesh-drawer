export const CANVAS_HEIGHT = "500px"
export const CANVAS_WIDTH = "500px"

export type PointType = { x: number; y: number };

export function Point( {x, y}: PointType) {
  return (
    <svg
      height={CANVAS_HEIGHT}
      width={CANVAS_WIDTH}
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "fixed", zIndex: 2 }}
    >
      <circle cx={x} cy={y} r="4" stroke="#AFEEEE" fill="#AFEEEE"></circle>
    </svg>
  )
}