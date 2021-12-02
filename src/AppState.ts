import { chainedMergeTest, multiColumnMergeTest } from "./TestGrids";
import { getNextValue, getValueIndex, MaybeValue, Value, Values } from "./Values";

const ROWS = 6;
const COLUMNS = 5;
const WIN_CONDITION: Value = "512k";

interface Move {
  column: number;
  value: Value;
}

export interface AppState {
  grid: MaybeValue[][];
  nextTile: MaybeValue;
  nextTileRange: {
    start: number;
    end: number;
  }
  highestSeen: Value;
  // Columns that recently dropped
  recentlyDroppedColumns: number[];
  isMerging: boolean;
  hasWon: boolean;
  history: Move[];
}

export function createAppState(): AppState {
  return {
    grid: createGrid(),
    nextTile: getNewNextTile(0, 5),
    nextTileRange: {
      start: 0,
      end: 5,
    },
    highestSeen: "2",
    recentlyDroppedColumns: [],
    isMerging: false,
    hasWon: false,
    history: [],
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
      return startMergeAfterAdd(appState, columnId, appState.nextTile);
    } else {
      return appState;
    }

  // Add tile to the top of the column
  } else {
    appState.grid[columnId][rowId] = appState.nextTile;
    return startMergeAfterAdd(appState, columnId, appState.nextTile);
  }
}

function startMergeAfterAdd(appState: AppState, addedToColumn: number, nextTile: Value): AppState {
  appState.history.push({ value: nextTile, column: addedToColumn });
  return {
    grid: copyGrid(appState.grid),
    nextTile: null,
    nextTileRange: appState.nextTileRange,
    highestSeen: appState.highestSeen,
    recentlyDroppedColumns: [addedToColumn],
    isMerging: true,
    hasWon: appState.hasWon,
    history: appState.history,
  }
}

export function runAppStep(appState: AppState): AppState {
  let didSomething = false;

  // Remove any gaps
  if (!didSomething) {
    didSomething = removeGaps(appState);
  }

  // Merge cells
  if (!didSomething) {
    didSomething = maybeSmartMerge(appState);
  }

  const highestSeen = getCurrentHighest(appState) || "2";

  if (!didSomething) {
    const updatedRange = maybeUpdateRange(appState, highestSeen);
    if (updatedRange) {
      didSomething = removeBelowRange(appState);
    }
  }

  return {
    grid: appState.grid,
    nextTile: !didSomething ? getNewNextTile(appState.nextTileRange.start, appState.nextTileRange.end) : null,
    nextTileRange: appState.nextTileRange,
    highestSeen,
    recentlyDroppedColumns: didSomething ? appState.recentlyDroppedColumns : [],
    isMerging: didSomething,
    hasWon: highestSeen === WIN_CONDITION,
    history: appState.history,
  };
}

function removeGaps(appState: AppState): boolean {
  let didSomething = false;
  const { grid } = appState;
  const droppedColumns: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    const rowId = getTopOfColumn(appState, i);
    if (rowId != null && rowId < grid[i].length - 1) {
      for (let j = rowId; j < grid[i].length - 1; j++) {
        if (grid[i][j + 1] != null) {
          // Shuffle things down
          grid[i][j] = grid[i][j + 1];
          grid[i][j + 1] = null;
          didSomething = true;
          // Add to recently dropped
          if (droppedColumns[droppedColumns.length - 1] !== i) {
            droppedColumns.push(i);
          }
        }
      }
    }
  }

  if (didSomething) {
    appState.recentlyDroppedColumns = droppedColumns;
  }

  return didSomething;
}

/**
 * This is a slightly silly way to calculate merging, but essentially does two passes over the grid. The first
 * calculates the number of matching neighbours for each cell. The next pass determines which cell should be merged.
 *
 * @param appState The current app state
 * @returns Whether we merged anything or not
 */
function maybeSmartMerge(appState: AppState): boolean {
  const {grid} = appState;
  const matchingNeighboursGrid: number[][][][] = neighboursGrid();
  let didSomething = false;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] == null) {
        break;
      }

      matchingNeighboursGrid[i][j] = getMatchingNeighbours(grid, i, j);
    }
  }

  for (let i = 0; i < matchingNeighboursGrid.length; i++) {
    for (let j = 0; j < matchingNeighboursGrid[i].length; j++) {
      // If we have no matching neighbours, don't need to worry about the rest
      if (!matchingNeighboursGrid[i][j] || matchingNeighboursGrid[i][j].length === 0) {
        continue;
      }

      const matchingNeighbours = matchingNeighboursGrid[i][j];
      // When more than 1 neighbour matching, we must be the center and will merge the surrounding cells
      if (matchingNeighbours.length > 1) {
        // Should be 2 or 3 elements
        for (let k = 0; k < matchingNeighbours.length; k++) {
          const [cellCol, cellRow] = matchingNeighbours[k];
          grid[cellCol][cellRow] = null;
          // Don't need to worry about checking neighbours now
          matchingNeighboursGrid[cellCol][cellRow] = [];
        }
        const newValue = getNextValue(grid[i][j] as Value, matchingNeighbours.length);
        grid[i][j] = newValue;
        didSomething = true;

      // When we've 1 neighbour, we need to decide if we're the one to merge into
      } else {
        const [neighbourCol, neighbourRow] = matchingNeighbours[0];
        // First check whether the other neighbour just has more matching
        if (matchingNeighboursGrid[neighbourCol][neighbourRow].length === 1) {
          // If vertically aligned, we should merge upwards
          // or if horizontally aligned, merge if we're in a recently dropped column or there's no column
          if ((neighbourCol === i && j < neighbourRow) || (neighbourRow === j && (appState.recentlyDroppedColumns.findIndex((val) => val === i) >= 0))) {
            grid[neighbourCol][neighbourRow] = null;
            matchingNeighboursGrid[neighbourCol][neighbourRow] = [];
            grid[i][j] = getNextValue(grid[i][j] as Value, 1);
            didSomething = true;
          }
        }
      }
    }
  }

  return didSomething;
}

function neighboursGrid(): number[][][][] {
  const neighbours = [];
  for (let i = 0; i < COLUMNS; i++) {
    neighbours[i] = [[], [], [], [], [], []];
  }
  return neighbours;
}

/**
 *
 * @param grid The grid to check on
 * @param column Column of tile to check
 * @param row Row of tile to check
 * @returns Number of neighbours matching the value of the tile at (column, row)
 */
function getMatchingNeighbours(grid: MaybeValue[][], column: number, row: number): number[][] {
  const matchingNeighbours = [];
  // Check left
  if (column > 0 && grid[column - 1][row] === grid[column][row]) {
    matchingNeighbours.push([column - 1, row]);
  }
  // Check right
  if (column < grid.length - 1 && grid[column + 1][row] === grid[column][row]) {
    matchingNeighbours.push([column + 1, row]);
  }
  // Check above
  if (row > 0 && grid[column][row - 1] === grid[column][row]) {
    matchingNeighbours.push([column, row - 1]);
  }
  // Check below
  if (row < grid[column].length - 1 && grid[column][row + 1] === grid[column][row]) {
    matchingNeighbours.push([column, row + 1]);
  }

  return matchingNeighbours;
}

function getCurrentHighest(appState: AppState): MaybeValue {
  const {grid} = appState;
  let highestIdx = -1;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j] == null) {
        break;
      } else {
        const currIdx = Values.findIndex(function(val, index) {
          return val === grid[i][j];
        });
        highestIdx = Math.max(highestIdx, currIdx);
      }
    }
  }

  return highestIdx >= 0 ? Values[highestIdx] : null;
}

function maybeUpdateRange(appState: AppState, currHighest: Value): boolean {
  const idx = getValueIndex(currHighest);

  if (idx >= 10 && Math.floor(idx / 2) + 1 > appState.nextTileRange.end) {
    appState.nextTileRange.end = Math.floor(idx / 2) + 1;
    appState.nextTileRange.start = appState.nextTileRange.end - 5;
    return true;
  } else {
    return false;
  }
}

function removeBelowRange(appState: AppState): boolean {
  const {grid} = appState;
  let didSomething = false;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j] != null) {
        const idx = getValueIndex(grid[i][j] as Value);
        if (idx < appState.nextTileRange.start) {
          grid[i][j] = null;
          didSomething = true;
        }
      }
    }
  }

  return didSomething;
}

/*
 * HELPERS
 */

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