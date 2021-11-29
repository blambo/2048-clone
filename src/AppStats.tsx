import React from "react";
import Tile from "./Tile";
import { MaybeValue, Value } from "./Values";
import "./AppStats.css";

interface AppStatsProps {
  highest: MaybeValue;
  bottomRange: Value;
  topRange: Value;
}

function AppStats(props: AppStatsProps) {
  return (
    <div className="AppStats">
      <div className="AppStats-highest">
        <div className="App-text">Highest seen:</div>
        <div className="App-text AppStats-tile-holder">
          {props.highest != null && <Tile value={props.highest} />}
        </div>
      </div>
      <div className="AppStats-range-stats">
        <div className="App-text">Current Range:</div>
        <div className="App-text AppStats-range-holder">
          <div className="AppStats-tile-holder">
            <Tile value={props.bottomRange} />
          </div>
          <div className="AppStats-range-divider">to</div>
          <div className="AppStats-tile-holder">
            <Tile value={props.topRange} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppStats;