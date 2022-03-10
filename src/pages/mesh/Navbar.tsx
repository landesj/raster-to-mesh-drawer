import { OsmBuildings } from "./components/OsmBuildings";
import { Roads } from "./components/Roads";
import { Vegetation } from "./components/Vegetation";

export function Navbar() {
  return (
    <div>
      <Vegetation /> <Roads /> <OsmBuildings />
    </div>
  );
}
