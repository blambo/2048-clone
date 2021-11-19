import { getNextValue, MaybeValue, Value, Values } from "./Values";

const ROWS = 6;
const COLUMNS = 5;

export interface AppState {
  grid: MaybeValue[][];
  nextTile: MaybeValue;
  nextTileRange: {
    start: number;
    end: number;
  }
  lastColumn: number | null;
  isMerging: boolean;
}

export function createAppState(): AppState {
  return {
    grid: createGrid(),
    nextTile: getNewNextTile(0, 2),
    nextTileRange: {
      start: 0,
      end: 2,
    },
    lastColumn: null,
    isMerging: false,
  };
}

// Creates data for 5 * 6 grid
function createGrid(): MaybeValue[][] {
  const grid: MaybeValue[][] = [];
  for (let i = 0; i < COLUMNS; i++) {
    grid[i] = [null, null, null, null, null, null];
  }

  return grid;
}

function copyGrid(original: MaybeValue[][]): MaybeValue[][] {
  const newGrid: MaybeValue[][] = [];
  for (let i = 0; i < COLUMNS; i++) {
    newGrid[i] = [];
    for (let j = 0; j < ROWS; j++) {
      newGrid[i][j] = original[i][j];
    }
  }
  return newGrid;
}

export function addTile(appState: AppState, columnId: number): AppState {
  const rowId = getTopOfColumn(appState, columnId);

  if (appState.nextTile == null) {
    // Do nothing...
    return appState;

  // Allow user to add a tile that matches the top of a full column
  } else if (rowId == null) {
    if (appState.grid[columnId][ROWS - 1] === appState.nextTile) {
      const newValue = getNextValue(appState.grid[columnId][ROWS - 1] as Value);
      appState.grid[columnId][ROWS - 1] = newValue;
      return startMergeAfterAdd(appState, columnId);
    } else {
      return appState;
    }

  // Add tile to the top of the column
  } else {
    appState.grid[columnId][rowId] = appState.nextTile;
    return startMergeAfterAdd(appState, columnId);
  }
}

function startMergeAfterAdd(appState: AppState, addedToColumn: number): AppState {
  return {
    grid: copyGrid(appState.grid),
    nextTile: null,
    nextTileRange: appState.nextTileRange,
    lastColumn: addedToColumn,
    isMerging: true,
  }
}

export function runMergeStep(appState: AppState): AppState {
  let didSomething = false;
  if (!didSomething) {
    didSomething = removeGaps(appState);
  }
  if (!didSomething) {
    didSomething = maybeMerge(appState);
  }

  return {
    grid: appState.grid,
    nextTile: !didSomething ? getNewNextTile(appState.nextTileRange.start, appState.nextTileRange.end) : null,
    nextTileRange: appState.nextTileRange,
    lastColumn: didSomething ? appState.lastColumn : null,
    isMerging: didSomething,
  };
}

function removeGaps(appState: AppState): boolean {
  let didSomething = false;
  const { grid } = appState;
  for (let i = 0; i < grid.length; i++) {
    const rowId = getTopOfColumn(appState, i);
    if (rowId != null && rowId < grid[i].length - 1) {
      for (let j = rowId; j < grid[i].length - 1; j++) {
        if (grid[i][j + 1] != null) {
          // Shuffle things down
          grid[i][j] = grid[i][j + 1];
          grid[i][j + 1] = null;
          didSomething = true;
        }
      }
    }
  }

  return didSomething;
}

function maybeMerge(appState: AppState): boolean {
  const {grid, lastColumn} = appState;

  // Check last added column
  if (lastColumn == null) {
    throw new Error("Trying to merge without a lastColumn");
  }
  const maybeRowId = getTopOfColumn(appState, lastColumn)
  // getTopOfColumn returns the highest empty cell, so need to convert it
  const rowId = maybeRowId == null ? grid[0].length - 1 : maybeRowId - 1;

  let increaseBy = 0;
  // Check left
  if (lastColumn > 0 && grid[lastColumn - 1][rowId] === grid[lastColumn][rowId]) {
    increaseBy++;
    grid[lastColumn - 1][rowId] = null;
  }
  // Check right
  if (lastColumn < grid.length - 1 && grid[lastColumn + 1][rowId] === grid[lastColumn][rowId]) {
    increaseBy++;
    grid[lastColumn + 1][rowId] = null;
  }
  // Check above
  if (grid[lastColumn][rowId] === grid[lastColumn][rowId - 1]) {
    increaseBy++;
  }

  // Get next value
  if (increaseBy > 0) {
    const newValue = getNextValue(grid[lastColumn][rowId] as Value, increaseBy);

    if (grid[lastColumn][rowId] === grid[lastColumn][rowId - 1]) {
      grid[lastColumn][rowId] = null;
      grid[lastColumn][rowId - 1] = newValue;
    } else {
      grid[lastColumn][rowId] = newValue;
    }

    // Mark as done something if we were increasing a tile
    return true;
  }

  return false;
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

function getNewNextTile(start: number, end: number): Value {
  const idx = randomIntFromInterval(start, end);
  return Values[idx];
}

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}