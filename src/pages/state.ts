import { atom } from "recoil";
import { MapBounds } from "../mapUtils";

type MeshBounds = {
  bounds: MapBounds;
  type: "osm" | "import";
};

export const MeshBoundsState = atom<MeshBounds | undefined>({
  key: "MeshBoundsState",
  default: undefined,
});

export const HasGeorasterState = atom<boolean>({
  key: "HasGeorasterState",
  default: false,
});
