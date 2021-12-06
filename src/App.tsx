import React, { useEffect, useState } from "react";
import "./App.css";
import { addTile, createAppState, Move, runAppStep } from "./AppState";
import AppStats from "./AppStats";
import Grid from "./Grid";
import PreviewTile from "./PreviewTile";
import { Values } from "./Values";
import { Storage } from "./Storage";

const DEBUG = true;

function App() {
  const storage = new Storage();
  const initialState = storage.hasSavedState() ? storage.loadState() : createAppState(DEBUG);

  const [appState, setAppState] = useState(initialState);
  const [showingHistory, setShowingHistory] = useState(false);
  const [replay, setReplay] = useState<Replay | null>(null);

  useEffect(() => {
    if (appState.isMerging) {
      setTimeout(() => setAppState(runAppStep(appState)), getMoveSpeed(replay != null));
    } else {
      storage.saveState(appState);
    }
  });

  function addTileWrapper(columnId: number): void {
    const newAppState = addTile(appState, columnId);
    setAppState(newAppState);
  }

  return (
    <div className="App">
      {DEBUG && (
        <div>
          <button onMouseDown={() => setShowingHistory(!showingHistory)}>Show history</button>
          <span>
            <input id="history-replay-input" />
            <button
              onMouseDown={function () {
                const stringifiedHistory = (document.getElementById("history-replay-input") as HTMLInputElement).value;
                const addedReplay = createReplay(JSON.parse(stringifiedHistory));
                setReplay(addedReplay);
              }}
            >
              Load History
            </button>
          </span>
        </div>
      )}
      {showingHistory && (
        <div>
          <div>
            <button
              onMouseDown={function () {
                navigator.clipboard.writeText(JSON.stringify(appState.history));
              }}
            >
              Copy History
            </button>
          </div>
          <div>
            {appState.history.map(function (move) {
              return <MoveHistoryEntry entry={move} />;
            })}
          </div>
        </div>
      )}
      {!showingHistory && !appState.hasWon && (
        <header className="App-header">
          <button onMouseDown={() => setAppState(createAppState(DEBUG))}>Start Again</button>
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
      )}
      {!showingHistory && appState.hasWon && (
        <header className="App-header">
          <div className="App-text">You WIN!</div>
          <button onMouseDown={() => setAppState(createAppState(DEBUG))}>Start Again</button>
        </header>
      )}
    </div>
  );
}

export default App;

/**
 * NEXT STEPS:
 *  - add validation of state to avoid cheating
 *  - treat upwards merge as dropped column
 *  - test out gap closing, maybe bug?
 *  - add 'see previous state' debug feature
 */

interface MoveHistoryEntryProps {
  entry: Move;
}

function MoveHistoryEntry({ entry }: MoveHistoryEntryProps) {
  return (
    <div>
      <span>{entry.value}</span>
      <span> into </span>
      <span>{entry.column}</span>
    </div>
  );
}

interface Replay {
  history: Move[];
  currIndex: number;
}

function createReplay(history: Move[]): Replay {
  return {
    history,
    currIndex: 0,
  };
}

function getMoveSpeed(hasReplay: boolean): number {
  if (hasReplay) {
    return 25;
  } else {
    return 200;
  }
}
