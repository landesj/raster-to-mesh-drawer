import { Navbar } from "../style";
import { OsmBuildings } from "./components/OsmBuildings";
import { Roads } from "./components/Roads";
import { Vegetation } from "./components/Vegetation";

export function MeshNavbar() {
  return (
    <Navbar>
      <Vegetation /> <Roads /> <OsmBuildings />
    </Navbar>
  );
}
