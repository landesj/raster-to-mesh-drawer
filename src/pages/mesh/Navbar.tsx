import { Navbar } from "../style";
import { Roads } from "./components/Roads";
import { Vegetation } from "./components/Vegetation";

export function MeshNavbar() {
  return (
    <Navbar>
      <Vegetation /> <Roads />
    </Navbar>
  );
}
