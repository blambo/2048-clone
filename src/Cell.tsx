import React from "react";
import { MaybeValue } from "./Values";
import "./Cell.css";
import Tile from "./Tile";

interface CellProps {
  value: MaybeValue;
}

function Cell(props: CellProps) {
  const {value} = props;

  const internal = value == null ? (<span></span>) : (<Tile value={value} />);

  return (<div className="Cell">{internal}</div>);
}

export default Cell;