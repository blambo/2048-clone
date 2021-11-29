import { AppState } from "./AppState";

class Storage {

  private static STORAGE_KEY = "2048_saved_state"

  public hasSavedState(): boolean {
    return localStorage.getItem(Storage.STORAGE_KEY) != null;
  }

  public saveState(state: AppState): void {
    const stringified = JSON.stringify(state);
    localStorage.setItem(Storage.STORAGE_KEY, stringified);
  }

  public loadState(): AppState {
    const stringified = localStorage.getItem(Storage.STORAGE_KEY);
    if (stringified == null) {
      throw new Error("No saved state to load");
    } else {
      try {
        const state = JSON.parse(stringified);
        // TOOD: Add validation
        return state;
      } catch (e) {
        throw new Error("Could not parse saved state");
      }
    }
  }
}

export { Storage };
