import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./Point";

export type LineType = { xSrc: number; ySrc: number; xDst: number; yDst: number };


export function Line({ xSrc, ySrc, xDst, yDst }: LineType) {
    return (
      <svg
        height={CANVAS_HEIGHT}
        width={CANVAS_WIDTH}
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