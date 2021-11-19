import React, { useEffect, useState } from 'react';
import './App.css';
import { addTile, createAppState, runAppStep } from './AppState';
import AppStats from './AppStats';
import Grid from './Grid';
import PreviewTile from './PreviewTile';
import { Values } from './Values';

function App() {
  const [appState, setAppState] = useState(createAppState());

  useEffect(() => {
    if (appState.isMerging) {
      setTimeout(() => setAppState(runAppStep(appState)), 200);
    }
  });

  function addTileWrapper(columnId: number): void {
    const newAppState = addTile(appState, columnId);
    setAppState(newAppState);
  }

  return (
    <div className="App">
      <header className="App-header">
        <AppStats highest={appState.highestSeen} bottomRange={Values[appState.nextTileRange.start]} topRange={Values[appState.nextTileRange.end]} />
        <Grid grid={appState.grid} addTile={addTileWrapper} />
        <div className="App-preview-holder">
          <PreviewTile value={appState.nextTile} />
        </div>
      </header>
    </div>
  );
}

export default App;

/**
 * NEXT STEPS:
 *  - Updating range of possible tiles
 *  - Add win condition
 */