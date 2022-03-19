import styled from "styled-components";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  padding: 10px;
`;

export const Navbar = styled.div`
  padding-top: 5px;
`;

export const Button = styled.button`
  background-color: #3d9970;
  height: 25px;
  width: 150px;
  border: none;
  border-radius: 8px;
  margin-right: 10px;
  &:hover {
    background-color: lightblue;
  }
`;

export const Label = styled.label.attrs({ for: "tif_input" })`
  background-color: #3d9970;
  text-align: center;
  width: 150px;
  display: inline-block;
  padding: 5px;
  border: none;
  border-radius: 8px;
  margin-left: 10px;
  margin-right: 10px;
  &:hover {
    background-color: lightblue;
  }
`;

export const Input = styled.input.attrs({ type: "file", accept: ".tif,.tiff" })`
  display: none;
`;
