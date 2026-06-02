import { createPesPostGroupStage } from "./pes.bracket";
import { drawPesGroups } from "./pes.draw";
import { generatePesGroupMatches } from "./pes.matches";
import { resetPesGame } from "./pes.reset";
import { getPesGameState } from "./pes.state";
import {
  updatePesGroupMatchScore,
  updatePesKnockoutMatchScore,
  updatePesTournamentScore,
} from "./pes.score";
import { getPesStandings } from "./pes.standings";
import type {
  PesPlayerInput,
  PesGameState,
  PesGroupScoreInput,
  PesKnockoutScoreInput,
  PesScoreInput,
  PesStandingRow,
  PesTeamInput,
  PesTournamentOptions,
  PesTournamentState,
  PesUiGameState,
} from "./pes.types";

export class PesService {
  createTournament(
    players: PesPlayerInput[],
    teams: PesTeamInput[],
    options: PesTournamentOptions,
  ): PesTournamentState {
    const drawResult = drawPesGroups({
      players,
      numberOfGroups: options.groupCount,
      availableTeams: teams,
      useRepechage: options.useRepechage,
      random: options.random,
    });

    if (!drawResult.ok) {
      throw new Error(drawResult.error);
    }

    const groups = drawResult.groupData;
    const matches = generatePesGroupMatches(groups);

    return {
      groups,
      matches,
      matchIdCounter: matches.length + 1,
      useRepechage: Boolean(options.useRepechage),
      repechageContext: [],
      champion: null,
      repechageChampion: null,
    };
  }

  updateScore(state: PesTournamentState, input: PesScoreInput): PesTournamentState {
    return updatePesTournamentScore(state, input);
  }

  updateGroupMatchScore(input: PesGroupScoreInput): PesTournamentState {
    return updatePesGroupMatchScore(input);
  }

  updateKnockoutMatchScore(input: PesKnockoutScoreInput): PesTournamentState {
    return updatePesKnockoutMatchScore(input);
  }

  getStandings(state: PesTournamentState): PesStandingRow[] {
    return getPesStandings(state.groups);
  }

  syncPostGroupStage(state: PesTournamentState): PesTournamentState {
    return createPesPostGroupStage(state);
  }

  resetGame(state: PesGameState): PesGameState;
  resetGame(state: PesTournamentState): PesTournamentState;
  resetGame(state: PesGameState | PesTournamentState): PesGameState | PesTournamentState {
    return resetPesGame(state as PesGameState);
  }

  getGameState(state: PesGameState | PesTournamentState): PesUiGameState {
    return getPesGameState(state);
  }
}

export const pesService = new PesService();
