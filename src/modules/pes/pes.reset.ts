import type { PesGameState, PesTournamentState } from "./pes.types";

export function resetPesGame(gameState: PesGameState): PesGameState;
export function resetPesGame(gameState: PesTournamentState): PesTournamentState;
export function resetPesGame(gameState: PesGameState | PesTournamentState): PesGameState | PesTournamentState {
  if ("groupData" in gameState || "matchData" in gameState || "standings" in gameState) {
    return {
      ...gameState,
      groupData: [],
      matchData: [],
      standings: [],
      champion: null,
      repechageChampion: null,
      updatedAt: new Date(),
    };
  }

  return {
    ...gameState,
    groups: [],
    matches: [],
    matchIdCounter: 1,
    champion: null,
    repechageChampion: null,
  };
}
