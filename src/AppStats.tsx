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
        <div>Highest seen:</div>
        <div className="AppStats-tile-holder">
          {props.highest != null && <Tile value={props.highest} />}
        </div>
      </div>
      <div className="AppStats-range-stats">
        <div>Current Range:</div>
        <div className="AppStats-range-holder">
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