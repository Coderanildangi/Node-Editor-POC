import * as React from "react";
import { ClassicPreset } from "rete";
import styled from "styled-components";
import { $socketsize } from "./vars";

const Styles = styled.div`
  display: inline-block;
  cursor: pointer;
  border: 1px solid grey;
  width: ${$socketsize}px;
  height: ${$socketsize}px;
  vertical-align: middle;
  background: #fff;
  z-index: 2;
  background: transparent;
  box-sizing: border-box;
  &:hover {
    background: red;
  }
`;

export function CustomSocket<T extends ClassicPreset.Socket>(props: {
  data: T;
}) {
  return <Styles title={props.data.name} />;
}
