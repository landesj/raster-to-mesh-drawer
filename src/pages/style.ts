import styled from "styled-components";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  padding: 10px;
`;

export const Navbar = styled.div`
  padding-bottom: 5px;
  height: 25px;
`;

export const Button = styled.button`
  background-color: #f0f0f0;
  font-family: "Trebuchet MS"
  font-size: 25px;
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
  background-color: #f0f0f0;
  font-family: "Trebuchet MS"
  font-size: 25px;
  text-align: center;
  width: 150px;
  display: inline-block;
  padding: 5px;
  border: none;
  border-radius: 8px;
  padding-top: 5px;
  margin-left: auto;
  margin-right: 0;
  margin-top: 5px;
  &:hover {
    background-color: lightblue;
  }
`;

export const Input = styled.input.attrs({ type: "file", accept: ".tif,.tiff" })`
  display: none;
`;
