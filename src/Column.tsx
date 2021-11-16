import React from "react";
import Cell from "./Cell";
import { MaybeValue } from "./Values";

interface ColumnProps {
  values: MaybeValue[];
  columnId: number;
  addTile: () => void
}

function Column(props: ColumnProps) {
  const cells = props.values.map(function(value, index) {
    return (<Cell value={value} key={index} />);
  });

  return (
    <div className="Column" onMouseDown={props.addTile}>
      {cells}
    </div>
  )
}

export default Column;