import React, { CSSProperties } from "react";
import { getValueColor, Value } from "./Values";
import "./Tile.css";

interface TileProps {
  value: Value;
}

function Tile(props: TileProps) {
  const {value} = props;

  return (
    <div className="Tile" style={generateTileStyle(value)}>
      <span className="App-text">{value}</span>
    </div>
  );
}

function generateTileStyle(value: Value): CSSProperties {
  const color = getValueColor(value);
  return {
    border: `1px solid rgb(${color})`,
    backgroundColor: `rgba(${color}, 0.3)`,
  }
}

export default Tile;
