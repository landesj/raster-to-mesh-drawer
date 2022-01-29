import { useState } from "react";
import styled from "styled-components";

const Page = styled.div`
  display: flex;
  flex-direction: column;
`;

export function RasterPage() {
  const [rasterState, setRasterState] = useState<ArrayBuffer | null>(null);

  const onChange = (files: FileList | null) => {
    if (files !== null) {
      const file = files[0];
      const reader = new FileReader();
      reader.onerror = () => {
        alert("Encountered an error when reading file.");
      };
      reader.onload = (file) => {
        setRasterState(file.target?.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  console.log(rasterState);

  return (
    <Page>
      <h2>This is the Raster page.</h2>
      <input
        type="file"
        accept=".tif,.tiff"
        onChange={(event) => onChange(event.target.files)}
      />
    </Page>
  );
}
