import React from "react";
import Tile from "./Tile";
import { Value } from "./Values";
import "./PreviewTile.css";

interface PreviewTileProps {
  value: Value;
}

function PreviewTile(props: PreviewTileProps) {
  return (
    <div className="PreviewTile">
      <div>Next tile:</div>
      <Tile value={props.value} />
    </div>
  )
}

export default PreviewTile;