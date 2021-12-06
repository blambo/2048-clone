import React from "react";
import { addTile, AppState } from "./AppState";
import AppStats from "./AppStats";
import Grid from "./Grid";
import { Replay } from "./MoveHistory";
import PreviewTile from "./PreviewTile";
import { Values } from "./Values";

interface GameBoardProps {
  setAppState: (state: AppState) => void;
  createAppState: (trackHistory: boolean) => AppState;
  trackHistory: boolean;
  appState: AppState;
  replay: Replay | null;
  setReplay: (replay: Replay) => void;
  addTileWrapper: (columnId: number) => void;
}

export function GameBoard({
  setAppState,
  createAppState,
  trackHistory,
  appState,
  replay,
  setReplay,
  addTileWrapper,
}: GameBoardProps) {
  return (
    <header className="App-header">
      <button onMouseDown={() => setAppState(createAppState(trackHistory))}>Start Again</button>
      <AppStats
        highest={appState.highestSeen}
        bottomRange={Values[appState.nextTileRange.start]}
        topRange={Values[appState.nextTileRange.end]}
      />
      <Grid grid={appState.grid} addTile={addTileWrapper} />
      {replay == null && (
        <div className="App-preview-holder">
          <PreviewTile value={appState.nextTile} />
        </div>
      )}
      {replay != null && (
        <div className="App-preview-holder">
          <span>
            {replay.currIndex + 1} of {replay.history.length}
          </span>
          <PreviewTile value={replay.history[replay.currIndex]?.value} />
          <div>
            <button
              onMouseDown={function () {
                const currEntry = replay.history[replay.currIndex];
                console.log("Adding", currEntry.value, "to", currEntry.column);
                setReplay({ history: replay.history, currIndex: replay.currIndex + 1 });
                setAppState(addTile(appState, currEntry.column, currEntry.value));
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
