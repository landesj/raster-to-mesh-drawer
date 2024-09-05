import { useRecoilValue } from "recoil";
import { RasterPage } from "../raster/RasterPage";
import MeshPage from "../mesh/MeshPage";
import { Intro } from "../intro/Intro";
import styled from "styled-components";
import { ProjectSetupState } from "../raster/state";

const AppPage = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

export function Main() {
  const isProjectSetup = useRecoilValue(ProjectSetupState);

  return isProjectSetup ? (
    <AppPage>
      <RasterPage />
      <MeshPage />
    </AppPage>
  ) : (
    <Intro />
  );
}
