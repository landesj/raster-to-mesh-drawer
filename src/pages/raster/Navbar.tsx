import { useRecoilState, useRecoilValue } from "recoil";
import { Button, Navbar } from "../style";
import { GroundPointListeningState, GroundPointState } from "./state";

type Props = {
  changeShowRasterState: () => void;
  rasterState: ArrayBuffer | null;
  showRasterText: string;
};

export function RasterNavbar({
  changeShowRasterState,
  rasterState,
  showRasterText,
}: Props) {
  const [groundPointListening, setGroundPointListening] = useRecoilState(
    GroundPointListeningState
  );
  const groundPoint = useRecoilValue(GroundPointState);

  const onClickGroundPointListening = () => {
    setGroundPointListening(!groundPointListening);
  };

  let groundPointText = "Pick Ground Point";
  if (groundPointListening) {
    groundPointText = "Unpick Ground Point";
  } else if (groundPoint) {
    groundPointText = "Update Ground Point";
  }

  return (
    <Navbar>
      {rasterState !== null && (
        <Button onClick={onClickGroundPointListening}>{groundPointText}</Button>
      )}
      {rasterState !== null && (
        <Button onClick={changeShowRasterState}>{showRasterText}</Button>
      )}
    </Navbar>
  );
}
