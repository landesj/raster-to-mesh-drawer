import { RecoilRoot } from "recoil";
import "./App.css";
import { RasterPage } from "./pages/raster/RasterPage";
import styled from "styled-components";
import { MeshPage } from "./pages/mesh/MeshPage";

const AppPage = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

function App() {
  return (
    <RecoilRoot>
      <AppPage>
        <RasterPage />
        <MeshPage />
      </AppPage>
    </RecoilRoot>
  );
}

export default App;
