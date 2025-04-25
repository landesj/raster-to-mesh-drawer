import { useRecoilState, useRecoilValue } from "recoil";
import { Button } from "@radix-ui/themes";
import { Navbar } from "../style";
import {
  GroundPointListeningState,
  GroundPointState,
  ShowOsmBuildingsState,
} from "./state";

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
  const [showOsmBuildings, setShowOsmBuildings] = useRecoilState(
    ShowOsmBuildingsState
  );

  const onClickGroundPointListening = () => {
    setGroundPointListening(!groundPointListening);
  };

  const onClickShowOsmBuildings = () => {
    setShowOsmBuildings(!showOsmBuildings);
  };

  let groundPointText = "Pick Ground Point";
  if (groundPointListening) {
    groundPointText = "Unpick Ground Point";
  } else if (groundPoint) {
    groundPointText = "Update Ground Point";
  }

  const groundOsmBuildingsText = showOsmBuildings
    ? "Hide Buildings"
    : "Show Buildings";

  return (
    <Navbar>
      {rasterState !== null && (
        <Button
          style={{ cursor: "pointer" }}
          onClick={onClickGroundPointListening}
        >
          {groundPointText}
        </Button>
      )}
      {rasterState !== null && (
        <Button style={{ cursor: "pointer" }} onClick={changeShowRasterState}>
          {showRasterText}
        </Button>
      )}
      <Button style={{ cursor: "pointer" }} onClick={onClickShowOsmBuildings}>
        {groundOsmBuildingsText}
      </Button>
    </Navbar>
  );
}
