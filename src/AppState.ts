import { chainedMergeTest, multiColumnMergeTest } from "./TestGrids";
import { getNextValue, getValueIndex, MaybeValue, Value, Values } from "./Values";

const ROWS = 6;
const COLUMNS = 5;
const WIN_CONDITION: Value = "512k";

export interface Move {
  column: number;
  value: Value;
}

export interface AppState {
  grid: MaybeValue[][];
  nextTile: MaybeValue;
  nextTileRange: {
    start: number;
    end: number;
  };
  highestSeen: Value;
  // Columns that recently dropped
  recentlyDroppedColumns: number[];
  isMerging: boolean;
  hasWon: boolean;
  history: Move[];
  trackHistory?: boolean;
}

export function createAppState(trackHistory: boolean): AppState {
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
    trackHistory,
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

export function addTile(appState: AppState, columnId: number, forcedValue?: Value): AppState {
  const rowId = getTopOfColumn(appState, columnId);

  const nextTile = forcedValue ?? appState.nextTile;

  if (nextTile == null) {
    // Do nothing...
    return appState;

    // Allow user to add a tile that matches the top of a full column
  } else if (rowId == null) {
    if (appState.grid[columnId][ROWS - 1] === nextTile) {
      const newValue = getNextValue(appState.grid[columnId][ROWS - 1] as Value);
      appState.grid[columnId][ROWS - 1] = newValue;
      return startMergeAfterAdd(appState, columnId, nextTile);
    } else {
      return appState;
    }

    // Add tile to the top of the column
  } else {
    appState.grid[columnId][rowId] = nextTile;
    return startMergeAfterAdd(appState, columnId, nextTile);
  }
}

function startMergeAfterAdd(appState: AppState, addedToColumn: number, nextTile: Value): AppState {
  if (appState.trackHistory) {
    appState.history.push({ value: nextTile, column: addedToColumn });
  }
  return {
    grid: copyGrid(appState.grid),
    nextTile: null,
    nextTileRange: appState.nextTileRange,
    highestSeen: appState.highestSeen,
    recentlyDroppedColumns: [addedToColumn],
    isMerging: true,
    hasWon: appState.hasWon,
    history: appState.history,
  };
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
    for (let j = 0; j < grid[i].length - 1; j++) {
      if (grid[i][j] == null && grid[i][j+1] != null) {
        // Shuffle things down
        grid[i][j] = grid[i][j+1];
        grid[i][j+1] = null;
        didSomething = true;
        if (droppedColumns[droppedColumns.length - 1] !== i) {
          droppedColumns.push(i);
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
  const { grid } = appState;
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

  let verticallyMerged: number[] = [];

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
        if (shouldSingleMerge(appState, matchingNeighboursGrid, i, j)) {
          const [neighbourCol, neighbourRow] = matchingNeighbours[0];
          grid[neighbourCol][neighbourRow] = null;
          matchingNeighboursGrid[neighbourCol][neighbourRow] = [];
          grid[i][j] = getNextValue(grid[i][j] as Value, 1);

          // If we're merging vertically we should treat this column as the most recently dropped
          if (neighbourCol === i) {
            verticallyMerged.push(i);
          }
          didSomething = true;
        }
      }
    }
  }

  if (verticallyMerged.length > 0) {
    appState.recentlyDroppedColumns = verticallyMerged;
  }

  return didSomething;
}

export function shouldSingleMerge(
  appState: AppState,
  matchingNeighboursGrid: number[][][][],
  col: number,
  row: number,
): boolean {
  const matchingNeighbours = matchingNeighboursGrid[col][row];
  const [neighbourCol, neighbourRow] = matchingNeighbours[0];

  // If our neighbour has more matching neighbours they should be the one merging
  if (matchingNeighboursGrid[neighbourCol][neighbourRow].length > 1) {
    return false;
  }

  // If vertically aligned, we should merge upwards
  if (neighbourCol === col && row < neighbourRow) {
    return true;
  }

  // Reaching here we must be horizontally aligned
  // If there is no recently dropped columns then merge now
  // Else if we are in a recently dropped column
  // Else if we are not a recently dropped column and neither is the other column
  if (
    appState.recentlyDroppedColumns.length === 0 ||
    appState.recentlyDroppedColumns.findIndex((val) => val === col) >= 0 ||
    appState.recentlyDroppedColumns.findIndex((val) => val === neighbourCol) < 0
  ) {
    return true;
  }

  return false;
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
  const { grid } = appState;
  let highestIdx = -1;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j] == null) {
        break;
      } else {
        const currIdx = Values.findIndex(function (val, index) {
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
  const { grid } = appState;
  let didSomething = false;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
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
  return appState.grid[columnId].reduce(function (prev, curr, currIdx) {
    if (prev != null) {
      return prev;
    } else if (curr == null) {
      return currIdx;
    } else {
      return null;
    }
  }, null as number | null);
}

function getNewNextTile(start: number, end: number): Value {
  const idx = randomIntFromInterval(start, end);
  return Values[idx];
}

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
