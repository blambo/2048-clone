import React from "react";
import Column from "./Column";
import { MaybeValue } from "./Values";
import "./Grid.css";

interface GridProps {
  grid: MaybeValue[][];
  addTile: (columnId: number) => void;
}

function Grid(props: GridProps) {
  const columns = props.grid.map(function(column, index) {
    return (<Column key={index} values={column} columnId={index} addTile={() => props.addTile(index)} />);
  });
  return (
    <div className="Grid">
      {columns}
    </div>
  )
}

export default Grid;