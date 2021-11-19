import React from "react";
import Tile from "./Tile";
import { MaybeValue } from "./Values";
import "./PreviewTile.css";

interface PreviewTileProps {
  value: MaybeValue;
}

function PreviewTile(props: PreviewTileProps) {
  return (
    <div className="PreviewTile">
      <div>Next tile:</div>
      { props.value != null && <Tile value={props.value} /> }
    </div>
  )
}

export default PreviewTile;