import { AppState, Move } from "./AppState";
import { MaybeValue } from "./Values";

export function cloneAppState(orig: AppState): AppState {
  return {
    grid: cloneGrid(orig.grid),
    nextTile: orig.nextTile,
    nextTileRange: {
      start: orig.nextTileRange.start,
      end: orig.nextTileRange.end,
    },
    highestSeen: orig.highestSeen,
    recentlyDroppedColumns: cloneDroppedColumns(orig.recentlyDroppedColumns),
    isMerging: orig.isMerging,
    hasWon: orig.hasWon,
    history: cloneHistory(orig.history),
    trackHistory: orig.trackHistory,
  };
}

function cloneGrid(orig: MaybeValue[][]): MaybeValue[][] {
  const grid: MaybeValue[][] = [];
  for (let i = 0; i < orig.length; i++) {
    grid[i] = [];
    for (let j = 0; j < orig[i].length; j++) {
      grid[i][j] = orig[i][j];
    }
  }
  return grid;
}

function cloneDroppedColumns(orig: number[]): number[] {
  const cols: number[] = [];
  for (let col of orig) {
    cols.push(col);
  }
  return cols;
}

function cloneHistory(orig: Move[]): Move[] {
  const history: Move[] = [];
  for (let move of orig) {
    history.push(move);
  }
  return history;
}
