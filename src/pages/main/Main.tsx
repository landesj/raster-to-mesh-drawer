import { useRecoilValue } from "recoil";
import { RasterPage } from "../raster/RasterPage";
import MeshPage from "../mesh/MeshPage";
import { Intro } from "../intro/Intro";
import styled from "styled-components";
import { ProjectSetupState } from "../raster/state";
import { BottomPanel } from "../mesh/BottomPanel";

const AppPage = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

export function Main() {
  const isProjectSetup = useRecoilValue(ProjectSetupState);

  return isProjectSetup ? (
    <div>
      <AppPage>
        <RasterPage />
        <MeshPage />
      </AppPage>
      <BottomPanel />
    </div>
  ) : (
    <Intro />
  );
}
