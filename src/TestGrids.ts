/**
 * Helper file to store some different test starting grids
 */

import { MaybeValue } from "./Values";

// Best with a starting "2" into the second column from the left
export const chainedMergeTest: () => MaybeValue[][] = () =>
  [
    ["4", "2", "4", null, null, null],
    ["8", null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
  ];

// Best with a starting "2" into the middle column
export const multiColumnMergeTest: () => MaybeValue[][] = () =>
  [
    ["8", null, null, null, null, null],
    ["4", "8", null, null, null, null],
    ["2", null, null, null, null, null],
    ["4", "8", null, null, null, null],
    ["8", null, null, null, null, null],
  ];