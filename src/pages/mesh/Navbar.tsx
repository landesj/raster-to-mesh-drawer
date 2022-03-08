import { OsmBuildings } from "./OsmBuildings";
import { Roads } from "./Roads";
import { Vegetation } from "./Vegetation";

export function Navbar() {
  return (
    <div>
      <Vegetation /> <Roads /> <OsmBuildings />
    </div>
  );
}
