import { Button } from "@radix-ui/themes";
import styled from "styled-components";

const Page = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 50px;
  margin-top: 30%;
`;

export function Intro() {
  return (
    <Page>
      <Button style={{ cursor: "pointer" }}>Import</Button>
      <Button style={{ cursor: "pointer" }}>Try sample</Button>
    </Page>
  );
}
