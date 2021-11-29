import React, { useEffect, useState } from 'react';
import './App.css';
import { addTile, createAppState, runAppStep } from './AppState';
import AppStats from './AppStats';
import Grid from './Grid';
import PreviewTile from './PreviewTile';
import { Values } from './Values';
import { Storage } from "./Storage";

function App() {
  const storage = new Storage();
  const initialState = storage.hasSavedState() ? storage.loadState() : createAppState();

  const [appState, setAppState] = useState(initialState);

  useEffect(() => {
    if (appState.isMerging) {
      setTimeout(() => setAppState(runAppStep(appState)), 200);
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
      { !appState.hasWon &&
        <header className="App-header">
          <button onMouseDown={() => setAppState(createAppState())}>Start Again</button>
          <AppStats highest={appState.highestSeen} bottomRange={Values[appState.nextTileRange.start]} topRange={Values[appState.nextTileRange.end]} />
          <Grid grid={appState.grid} addTile={addTileWrapper} />
          <div className="App-preview-holder">
            <PreviewTile value={appState.nextTile} />
          </div>
        </header>
      }
      { appState.hasWon &&
        <header className="App-header">
          <div className="App-text">You WIN!</div>
          <button onMouseDown={() => setAppState(createAppState())}>Start Again</button>
        </header>
      }
    </div>
  );
}

export default App;

/**
 * NEXT STEPS:
 *  - record history of actions to diagnose bugs
 *  - add validation of state to avoid cheating
 */