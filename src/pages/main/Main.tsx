import { useRecoilValue } from "recoil";
import { HasGeorasterState } from "../state";
import { RasterPage } from "../raster/RasterPage";
import MeshPage from "../mesh/MeshPage";
import { Intro } from "../intro/Intro";
import styled from "styled-components";

const AppPage = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

export function Main() {
  const hasGeoraster = useRecoilValue(HasGeorasterState);

  return hasGeoraster ? (
    <AppPage>
      <RasterPage />
      <MeshPage />
    </AppPage>
  ) : (
    <Intro />
  );
}
