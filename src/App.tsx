import "./App.css";
import { RasterPage } from "./pages/raster/RasterPage";
import styled from "styled-components";
import MeshPage from "./pages/mesh/MeshPage";

const AppPage = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

function App() {
  return (
    <AppPage>
      <RasterPage />
      <MeshPage />
    </AppPage>
  );
}

export default App;
