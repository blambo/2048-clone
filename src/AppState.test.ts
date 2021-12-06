import { addTile, AppState, createAppState, runAppStep } from "./AppState";
import { MaybeValue } from "./Values";

test("merges matching neighbours", () => {
  const testState = createTestAppState([
    ["4", "2", "4", null, null, null],
    ["8", null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
  ]);
  const expectedResult = [
    ["4", "2", "4", null, null, null],
    [null, null, null, null, null, null],
    ["16", null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
  ];

  let result = addTile(testState, 2, "8");
  while (result.isMerging) {
    result = runAppStep(result);
  }

  expect(result.grid).toStrictEqual(expectedResult);
});


const createTestAppState = (grid: MaybeValue[][]): AppState => {
  const testAppState = createAppState(false);
  testAppState.grid = grid;
  return testAppState;
};
