import { createPesPostGroupStage, progressPesKnockoutRound } from "./pes.bracket";
import { createPesMatch } from "./pes.matches";
import { recalculatePesStandings } from "./pes.standings";
import type {
  PesChampion,
  PesGroupScoreInput,
  PesKnockoutScoreInput,
  PesMatch,
  PesMatchPlayer,
  PesScoreInput,
  PesTournamentState,
} from "./pes.types";

function assertValidScore(value: number, fieldName: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} deve ser um numero inteiro maior ou igual a zero.`);
  }
}

function updateMatchScore(match: PesMatch, input: PesScoreInput): PesMatch {
  assertValidScore(input.goals1, "goals1");
  assertValidScore(input.goals2, "goals2");

  if (match.isBye) return match;

  const isKnockout = match.stage !== "group";
  const isDraw = input.goals1 === input.goals2;

  if (isKnockout && isDraw) {
    if (input.penalties1 === undefined || input.penalties2 === undefined) {
      return {
        ...match,
        goals1: input.goals1,
        goals2: input.goals2,
        pen1: null,
        pen2: null,
        penalties1: null,
        penalties2: null,
        winnerPlayerId: null,
        winnerId: null,
        loserId: null,
        draw: true,
        isFinished: false,
        status: "draw_needs_penalties",
      };
    }

    const penalties1 = input.penalties1;
    const penalties2 = input.penalties2;
    if (penalties1 === null || penalties2 === null) {
      throw new Error("Penaltis devem ser informados para empate no mata-mata.");
    }
    assertValidScore(penalties1, "penalties1");
    assertValidScore(penalties2, "penalties2");

    if (penalties1 === penalties2) {
      throw new Error("Penaltis nao podem terminar empatados.");
    }

    return {
      ...match,
      goals1: input.goals1,
      goals2: input.goals2,
      pen1: penalties1,
      pen2: penalties2,
      penalties1,
      penalties2,
      winnerPlayerId: penalties1 > penalties2 ? match.player1.id : match.player2?.id ?? null,
      winnerId: penalties1 > penalties2 ? match.player1.id : match.player2?.id ?? null,
      loserId: penalties1 > penalties2 ? match.player2?.id ?? null : match.player1.id,
      draw: false,
      isFinished: true,
      status: "finished",
    };
  }

  return {
    ...match,
    goals1: input.goals1,
    goals2: input.goals2,
    pen1: null,
    pen2: null,
    penalties1: null,
    penalties2: null,
    winnerPlayerId:
      input.goals1 > input.goals2
        ? match.player1.id
        : input.goals2 > input.goals1
          ? match.player2?.id ?? null
          : null,
    winnerId:
      input.goals1 > input.goals2
        ? match.player1.id
        : input.goals2 > input.goals1
          ? match.player2?.id ?? null
          : null,
    loserId:
      input.goals1 > input.goals2
        ? match.player2?.id ?? null
        : input.goals2 > input.goals1
          ? match.player1.id
          : null,
    draw: input.goals1 === input.goals2,
    isFinished: true,
    status: "finished",
  };
}

function findMatchPlayerById(state: PesTournamentState, playerId: string): PesMatchPlayer | null {
  for (const group of state.groups) {
    const player = group.players.find((candidate) => candidate.id === playerId);

    if (player) {
      return {
        id: player.id,
        name: player.name,
        team: player.team,
      };
    }
  }

  for (const match of state.matches) {
    if (match.player1.id === playerId) return match.player1;
    if (match.player2?.id === playerId) return match.player2;
  }

  return null;
}

function createStageChampion(
  state: PesTournamentState,
  stage: Extract<PesMatch["stage"], "final" | "repechage">,
  playerId: string,
): PesChampion | null {
  const player = findMatchPlayerById(state, playerId);
  if (!player) return null;

  return {
    playerId: player.id,
    name: player.name,
    team: player.team,
    stage,
  };
}

function progressPesKnockoutStage(
  state: PesTournamentState,
  stage: Extract<PesMatch["stage"], "final" | "repechage">,
  round: number,
): PesTournamentState {
  const roundMatches = state.matches.filter((match) => match.stage === stage && match.round === round);
  if (roundMatches.length === 0) return state;
  if (!roundMatches.every((match) => match.isFinished)) return state;

  const winnerIds = roundMatches.flatMap((match) => (match.winnerPlayerId ? [match.winnerPlayerId] : []));

  if (winnerIds.length <= 1) {
    const winnerId = winnerIds[0];
    if (!winnerId) return state;

    const champion = createStageChampion(state, stage, winnerId);
    if (!champion) return state;

    return stage === "final"
      ? {
          ...state,
          champion,
        }
      : {
          ...state,
          repechageChampion: champion,
        };
  }

  const nextRound = round + 1;
  if (state.matches.some((match) => match.stage === stage && match.round === nextRound)) return state;

  let nextMatchId = state.matchIdCounter;
  const nextMatches: PesMatch[] = [];

  for (let index = 0; index < winnerIds.length; index += 2) {
    const player1 = findMatchPlayerById(state, winnerIds[index]);
    const player2 = winnerIds[index + 1] ? findMatchPlayerById(state, winnerIds[index + 1]) : null;

    if (!player1) continue;

    nextMatches.push(
      createPesMatch(
        stage,
        nextRound,
        nextMatches.length + 1,
        player1,
        player2,
        nextMatchId,
        {
          id: `${stage}-round-${nextRound}`,
          letter: `${stage}-${nextRound}`,
        },
      ),
    );
    nextMatchId += 1;
  }

  const nextState: PesTournamentState = {
    ...state,
    matches: [...state.matches, ...nextMatches],
    matchIdCounter: nextMatchId,
  };

  return nextMatches.every((match) => match.isFinished)
    ? progressPesKnockoutStage(nextState, stage, nextRound)
    : nextState;
}

export function updatePesKnockoutMatchScore({
  gameState,
  matchId,
  goals1,
  goals2,
  pen1,
  pen2,
}: PesKnockoutScoreInput): PesTournamentState {
  assertValidScore(goals1, "goals1");
  assertValidScore(goals2, "goals2");

  const targetMatch = gameState.matches.find((match) => match.id === matchId);
  if (!targetMatch) throw new Error("Partida nao encontrada.");
  if (targetMatch.stage !== "final" && targetMatch.stage !== "repechage") {
    throw new Error("Esta regra so pode ser aplicada em partidas de mata-mata.");
  }
  const stage = targetMatch.stage;
  if (targetMatch.isBye) return progressPesKnockoutStage(gameState, stage, targetMatch.round);
  if (!targetMatch.player2) {
    throw new Error("Partida de mata-mata invalida: jogador 2 nao encontrado.");
  }

  const isDraw = goals1 === goals2;

  if (isDraw && (pen1 === undefined || pen2 === undefined)) {
    const updatedMatch: PesMatch = {
      ...targetMatch,
      goals1,
      goals2,
      pen1: null,
      pen2: null,
      penalties1: null,
      penalties2: null,
      winnerPlayerId: null,
      winnerId: null,
      loserId: null,
      draw: true,
      isFinished: false,
      status: "draw_needs_penalties",
    };

    return {
      ...gameState,
      matches: gameState.matches.map((match) => (match.id === matchId ? updatedMatch : match)),
    };
  }

  const penalty1 = pen1 ?? null;
  const penalty2 = pen2 ?? null;

  if (isDraw) {
    if (penalty1 === null || penalty2 === null) {
      throw new Error("Penaltis devem ser informados para empate no mata-mata.");
    }

    assertValidScore(penalty1, "pen1");
    assertValidScore(penalty2, "pen2");

    if (penalty1 === penalty2) {
      throw new Error("Penaltis nao podem terminar empatados.");
    }
  }

  const winnerPlayerId = isDraw
    ? (penalty1 as number) > (penalty2 as number)
      ? targetMatch.player1.id
      : targetMatch.player2.id
    : goals1 > goals2
      ? targetMatch.player1.id
      : targetMatch.player2.id;
  const loserId = winnerPlayerId === targetMatch.player1.id ? targetMatch.player2.id : targetMatch.player1.id;

  const updatedMatch: PesMatch = {
    ...targetMatch,
    goals1,
    goals2,
    pen1: isDraw ? penalty1 : null,
    pen2: isDraw ? penalty2 : null,
    penalties1: isDraw ? penalty1 : null,
    penalties2: isDraw ? penalty2 : null,
    winnerPlayerId,
    winnerId: winnerPlayerId,
    loserId,
    draw: false,
    isFinished: true,
    status: "finished",
  };

  const nextState: PesTournamentState = {
    ...gameState,
    matches: gameState.matches.map((match) => (match.id === matchId ? updatedMatch : match)),
  };

  return progressPesKnockoutStage(nextState, stage, updatedMatch.round);
}

export function updatePesGroupMatchScore({
  gameState,
  matchId,
  goals1,
  goals2,
}: PesGroupScoreInput): PesTournamentState {
  assertValidScore(goals1, "goals1");
  assertValidScore(goals2, "goals2");

  const targetMatch = gameState.matches.find((match) => match.id === matchId);
  if (!targetMatch) throw new Error("Partida nao encontrada.");
  if (targetMatch.stage !== "group") {
    throw new Error("Esta regra so pode ser aplicada em partidas da fase de grupos.");
  }
  if (!targetMatch.player2) {
    throw new Error("Partida de grupo invalida: jogador 2 nao encontrado.");
  }

  const winnerPlayerId =
    goals1 > goals2 ? targetMatch.player1.id : goals2 > goals1 ? targetMatch.player2.id : null;

  const updatedMatch: PesMatch = {
    ...targetMatch,
    goals1,
    goals2,
    pen1: null,
    pen2: null,
    penalties1: null,
    penalties2: null,
    winnerPlayerId,
    winnerId: winnerPlayerId,
    loserId:
      goals1 > goals2 ? targetMatch.player2.id : goals2 > goals1 ? targetMatch.player1.id : null,
    draw: goals1 === goals2,
    isFinished: true,
    status: "finished",
  };

  const stateWithScore: PesTournamentState = {
    ...gameState,
    matches: gameState.matches.map((match) => (match.id === matchId ? updatedMatch : match)),
  };

  const stateWithStandings: PesTournamentState = {
    ...stateWithScore,
    groups: recalculatePesStandings(stateWithScore.groups, stateWithScore.matches),
  };

  return createPesPostGroupStage(stateWithStandings);
}

export function updatePesTournamentScore(
  state: PesTournamentState,
  input: PesScoreInput,
): PesTournamentState {
  const targetMatch = state.matches.find((match) => match.id === input.matchId);
  if (!targetMatch) throw new Error("Partida nao encontrada.");

  const updatedMatch = updateMatchScore(targetMatch, input);
  let nextState: PesTournamentState = {
    ...state,
    matches: state.matches.map((match) => (match.id === input.matchId ? updatedMatch : match)),
  };

  nextState = {
    ...nextState,
    groups: recalculatePesStandings(nextState.groups, nextState.matches),
  };

  if (updatedMatch.stage === "group") {
    return createPesPostGroupStage(nextState);
  }

  if (updatedMatch.status !== "finished") return nextState;

  return progressPesKnockoutRound(nextState, updatedMatch.stage, updatedMatch.round);
}
