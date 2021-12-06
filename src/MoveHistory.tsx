import React from "react";
import { Move } from "./AppState";

export interface MoveHistoryEntryProps {
  entry: Move;
}

export function MoveHistoryEntry({ entry }: MoveHistoryEntryProps) {
  return (
    <div>
      <span>{entry.value}</span>
      <span> into </span>
      <span>{entry.column}</span>
    </div>
  );
}

export interface Replay {
  history: Move[];
  currIndex: number;
}

export function createReplay(history: Move[]): Replay {
  return {
    history,
    currIndex: 0,
  };
}

