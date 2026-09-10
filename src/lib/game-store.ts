import { useSyncExternalStore } from "react";
import { LEVEL_MIN } from "@/lib/game-data";

export type GameMode = "campaign" | "endless" | "training";

export type GameState = {
  connected: boolean;
  address: string | null;
  /** Weird — the real token. */
  weird: number;
  xp: number;
  unlockedLevels: number;
  selectedLevel: number;
  squad: (string | null)[];
  commander: string | null;
  /** card id → level 1..10 */
  cardLevels: Record<string, number>;
  shadowLevel: number;
  /** multiverse card ids attached for the next fight (max 10) */
  multiverse: string[];
  /** friends knocked out and not yet revived */
  downed: string[];
  /** true while a chapter run is being fought — squad is locked */
  runActive: boolean;
  mode: GameMode;
  endlessWave: number;
  endlessBest: number;
};

const initial: GameState = {
  connected: false,
  address: null,
  weird: 1250,
  xp: 0,
  unlockedLevels: 4,
  selectedLevel: 1,
  squad: ["pip", "kit", "mossy", null, null, null, null],
  commander: "umbra",
  cardLevels: {},
  shadowLevel: LEVEL_MIN,
  multiverse: [],
  downed: [],
  runActive: false,
  mode: "campaign",
  endlessWave: 1,
  endlessBest: 1,
};

let state: GameState = initial;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setGameState(patch: Partial<GameState> | ((s: GameState) => Partial<GameState>)) {
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  emit();
}

export function useGameState(): GameState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function levelOf(s: GameState, id: string) {
  return s.cardLevels[id] ?? LEVEL_MIN;
}

/** Defeat wipes all progression back to base levels. */
export function resetProgression() {
  setGameState({ cardLevels: {}, shadowLevel: LEVEL_MIN, downed: [], runActive: false });
}
