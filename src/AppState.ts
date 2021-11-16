import { getNextValue, MaybeValue, Value } from "./Values";

export interface AppState {
  grid: MaybeValue[][];
  nextTile: Value;
  lastColumn: number | null;
  isMerging: boolean;
}

export function createAppState(): AppState {
  return {
    grid: createGrid(),
    nextTile: "2",
    lastColumn: null,
    isMerging: false,
  };
}

// Creates data for 5 * 6 grid
function createGrid(): MaybeValue[][] {
  const grid: MaybeValue[][] = [];
  for (let i = 0; i < 5; i++) {
    grid[i] = [null, null, null, null, null, null];
  }

  grid[0][0] = "2";

  return grid;
}

function copyGrid(original: MaybeValue[][]): MaybeValue[][] {
  const newGrid: MaybeValue[][] = [];
  for (let i = 0; i < original.length; i++) {
    newGrid[i] = [];
    for (let j = 0; j < original[i].length; j++) {
      newGrid[i][j] = original[i][j];
    }
  }
  return newGrid;
}

export function addTile(appState: AppState, columnId: number): AppState {
  const rowId = getTopOfColumn(appState, columnId);

  if (rowId == null) {
    // Do nothing...
    return appState;
  } else {
    appState.grid[columnId][rowId] = appState.nextTile;

    return {
      grid: copyGrid(appState.grid),
      nextTile: "2",
      lastColumn: columnId,
      isMerging: true,
    }
  }
}

export function runMergeStep(appState: AppState): AppState {
  let didSomething = false;
  const {grid, lastColumn} = appState;

  // Check last added column
  if (lastColumn == null) {
    throw new Error("Trying to merge without a lastColumn");
  }
  const maybeRowId = getTopOfColumn(appState, lastColumn)
  // getTopOfColumn returns the highest empty cell, so need to convert it
  const rowId = maybeRowId == null ? grid[0].length - 1 : maybeRowId - 1;

  if (rowId !== 0) {
    if (grid[lastColumn][rowId] === grid[lastColumn][rowId - 1]) {
      didSomething = true;
      const newValue = getNextValue(grid[lastColumn][rowId] as Value);
      grid[lastColumn][rowId] = null;
      grid[lastColumn][rowId - 1] = newValue;
    }
  }

  return {
    grid: appState.grid,
    nextTile: appState.nextTile,
    lastColumn: didSomething ? lastColumn : null,
    isMerging: didSomething,
  };
}

function getTopOfColumn(appState: AppState, columnId: number): number | null {
  return appState.grid[columnId].reduce(function(prev, curr, currIdx) {
    if (prev != null) {
      return prev;
    } else if (curr == null) {
      return currIdx;
    } else {
      return null;
    }
  }, null as (number | null));
}