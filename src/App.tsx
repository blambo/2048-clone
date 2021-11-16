import React, { useEffect, useState } from 'react';
import './App.css';
import { addTile, createAppState, runMergeStep } from './AppState';
import Grid from './Grid';
import PreviewTile from './PreviewTile';

function App() {
  const [appState, setAppState] = useState(createAppState());

  useEffect(() => {
    if (appState.isMerging) {
      setTimeout(() => setAppState(runMergeStep(appState)), 500);
    }
  });

  function addTileWrapper(columnId: number): void {
    const newAppState = addTile(appState, columnId);
    setAppState(newAppState);
  }

  return (
    <div className="App">
      <header className="App-header">
        <Grid grid={appState.grid} addTile={addTileWrapper} />
        <div className="App-preview-holder">
          <PreviewTile value={"8"} />
        </div>
      </header>
    </div>
  );
}

export default App;
