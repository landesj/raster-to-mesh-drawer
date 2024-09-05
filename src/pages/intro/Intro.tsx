import { Button } from "@radix-ui/themes";
import { useRef } from "react";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { ProjectSetupState, RasterState } from "../raster/state";

const Page = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 50px;
  margin-top: 30%;
`;

export function Intro() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setRasterState = useSetRecoilState(RasterState);
  const setProjectSetup = useSetRecoilState(ProjectSetupState);

  const handleChooseFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files !== null) {
      const file = files[0];
      const reader = new FileReader();
      reader.onerror = () => {
        alert("Encountered an error when reading file.");
      };
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => {
        setRasterState(reader.result as ArrayBuffer);
        setProjectSetup(true);
      };
    }
  };

  const handleTrySampleButtonClick = async () => {
    const response = await fetch("/sample.tif");
    if (!response.ok) {
      alert("Unable to get sample. Please import a custom file.");
      return;
    }
    const arrayBuffer = await response.arrayBuffer();
    setRasterState(arrayBuffer);
    setProjectSetup(true);
  };

  return (
    <Page>
      <Button
        onClick={handleChooseFileButtonClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        Choose file
      </Button>
      <input
        type="file"
        accept=".tif"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }} // Hide the default file input
        aria-label="File input"
      />
      <Button
        onClick={handleTrySampleButtonClick}
        style={{ cursor: "pointer" }}
      >
        Try sample
      </Button>
    </Page>
  );
}
