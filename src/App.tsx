import React, { useEffect, useState } from "react";
import "./App.css";
import { addTile, createAppState, runAppStep } from "./AppState";
import { Storage } from "./Storage";
import { cloneAppState } from "./Utils";
import { GameBoard } from "./GameBoard";
import { createReplay, MoveHistoryEntry, Replay } from "./MoveHistory";

function App() {
  const DEBUG = isDebugMode();

  const storage = new Storage();
  const initialState = storage.hasSavedState() ? storage.loadState() : createAppState(DEBUG);

  const [appState, setAppState] = useState(initialState);
  const [prevState, setPrevState] = useState(cloneAppState(appState));
  const [showingPrevious, setShowPrevious] = useState(false);
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
    setPrevState(cloneAppState(appState));
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
          <button onMouseDown={() => setShowPrevious(!showingPrevious)}>Show previous</button>
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
      {!showingHistory && showingPrevious && (
        <>
          <div>SHOWING PREVIOUS!!</div>
          <GameBoard
            setAppState={setAppState}
            createAppState={createAppState}
            trackHistory={DEBUG}
            appState={prevState}
            replay={replay}
            addTileWrapper={addTileWrapper}
            setReplay={setReplay}
          />
        </>
      )}
      {!showingHistory && !appState.hasWon && !showingPrevious && (
        <GameBoard
          setAppState={setAppState}
          createAppState={createAppState}
          trackHistory={DEBUG}
          appState={appState}
          replay={replay}
          addTileWrapper={addTileWrapper}
          setReplay={setReplay}
        />
      )}
      {!showingHistory && !showingPrevious && appState.hasWon && (
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
 *  - change merging prioritisation from columns to dropped cells
 *            [ ][ ][8][2][ ]
 *            [ ][ ][2][X][ ] --- Add 2 to X
 *            [ ][ ][4][ ][ ]
 *        This should result in:
 *            [ ][ ][4][8][ ]
 *            [ ][ ][ ][ ][ ]
 *            [ ][ ][ ][ ][ ]
 *        But currently the 4 moving down is making it merge left
 *  - add in settings, allow changing of animation speed
 *  - add in instructions
 */

function getMoveSpeed(hasReplay: boolean): number {
  if (hasReplay) {
    return 25;
  } else {
    return 200;
  }
}

function isDebugMode(): boolean {
  const paramString = window.location.href.split("?")[1];

  try {
    if (paramString != undefined) {
      const params = paramString.split("&");

      for (let i = 0; i < params.length; i++) {
        const [key, value] = params[i].split("=");
        if (key.toLocaleLowerCase() === "debug" && (value == undefined || value.toLocaleLowerCase() === "true")) {
          return true;
        }
      }
    }
  } catch (e) {
    return false;
  }

  return false;
}
