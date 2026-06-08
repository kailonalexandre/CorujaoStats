import { createPesMatch, toPesMatchPlayer } from "./pes.matches";
import { calculatePesStandings, getPesQualifiedPlayers } from "./pes.standings";
import type {
  PesChampion,
  PesChampionCheckResult,
  PesGroup,
  PesMatch,
  PesMatchPlayer,
  PesQualifiedPlayer,
  PesTournamentState,
} from "./pes.types";

function getPlayerById(groups: PesGroup[], playerId: string): PesMatchPlayer | null {
  for (const group of groups) {
    const player = group.players.find((candidate) => candidate.id === playerId);
    if (player) return toPesMatchPlayer(player);
  }

  return null;
}

function getChampionPlayer(gameState: PesTournamentState, playerId: string): PesChampion | null {
  for (const group of gameState.groups) {
    const player = group.players.find((candidate) => candidate.id === playerId);

    if (player) {
      return {
        playerId: player.id,
        name: player.name,
        nickname: player.nickname,
        photoUrl: player.photoUrl,
        teamName: player.team?.name ?? player.teamName ?? null,
        team: player.team,
      };
    }
  }

  for (const match of gameState.matches) {
    const player = match.player1.id === playerId ? match.player1 : match.player2?.id === playerId ? match.player2 : null;

    if (player) {
      return {
        playerId: player.id,
        name: player.name,
        teamName: player.team?.name ?? null,
        team: player.team,
      };
    }
  }

  return null;
}

export function checkPesChampion(
  gameState: PesTournamentState,
  stage: Extract<PesMatch["stage"], "final" | "repechage">,
): PesChampionCheckResult {
  const stageMatches = gameState.matches.filter((match) => match.stage === stage);
  if (stageMatches.length === 0) {
    return {
      champion: gameState.champion,
      repechageChampion: gameState.repechageChampion,
    };
  }

  const lastRound = Math.max(...stageMatches.map((match) => match.round));
  const lastRoundMatches = stageMatches.filter((match) => match.round === lastRound);

  if (!lastRoundMatches.every((match) => match.isFinished)) {
    return {
      champion: gameState.champion,
      repechageChampion: gameState.repechageChampion,
    };
  }

  const winnerIds = Array.from(
    new Set(lastRoundMatches.flatMap((match) => (match.winnerPlayerId ? [match.winnerPlayerId] : []))),
  );

  if (winnerIds.length !== 1) {
    return {
      champion: gameState.champion,
      repechageChampion: gameState.repechageChampion,
    };
  }

  const champion = getChampionPlayer(gameState, winnerIds[0]);
  if (!champion) {
    return {
      champion: gameState.champion,
      repechageChampion: gameState.repechageChampion,
    };
  }

  return stage === "final"
    ? {
        champion,
        repechageChampion: gameState.repechageChampion,
      }
    : {
        champion: gameState.champion,
        repechageChampion: champion,
      };
}

function toBracketMatchPlayer(player: PesQualifiedPlayer): PesMatchPlayer {
  return {
    id: player.playerId,
    name: player.playerName,
    team: player.teamName
      ? {
          id: player.teamName,
          name: player.teamName,
        }
      : null,
  };
}

function findOpponentIndex(players: PesQualifiedPlayer[], player: PesQualifiedPlayer): number {
  const differentGroupIndex = players.findIndex((candidate) => candidate.groupLetter !== player.groupLetter);
  return differentGroupIndex === -1 ? 0 : differentGroupIndex;
}

function getTwoGroupSemifinalOrder(players: PesQualifiedPlayer[]): PesQualifiedPlayer[] | null {
  if (players.length !== 4) return null;

  const groups = Array.from(new Set(players.map((player) => player.groupLetter))).sort((first, second) =>
    first.localeCompare(second),
  );
  if (groups.length !== 2) return null;

  const [groupA, groupB] = groups;
  const firstGroupWinner = players.find((player) => player.groupLetter === groupA && player.position === 1);
  const firstGroupRunnerUp = players.find((player) => player.groupLetter === groupA && player.position === 2);
  const secondGroupWinner = players.find((player) => player.groupLetter === groupB && player.position === 1);
  const secondGroupRunnerUp = players.find((player) => player.groupLetter === groupB && player.position === 2);

  if (!firstGroupWinner || !firstGroupRunnerUp || !secondGroupWinner || !secondGroupRunnerUp) return null;

  return [firstGroupWinner, secondGroupRunnerUp, secondGroupWinner, firstGroupRunnerUp];
}

export function generatePesMainBracket(qualifiedPlayers: PesQualifiedPlayer[]): PesMatch[] {
  const remainingPlayers = [...(getTwoGroupSemifinalOrder(qualifiedPlayers) ?? qualifiedPlayers)];
  const matches: PesMatch[] = [];

  while (remainingPlayers.length > 0) {
    const player1 = remainingPlayers.shift();
    if (!player1) break;

    const hasBye = remainingPlayers.length === 0;
    const player2 = hasBye ? null : remainingPlayers.splice(findOpponentIndex(remainingPlayers, player1), 1)[0];
    const isBye = player2 === null;

    matches.push({
      id: `pes-final-r1-${matches.length + 1}`,
      stage: "final",
      round: 1,
      groupId: null,
      groupLetter: player1.groupLetter,
      groupIndex: null,
      matchIndex: matches.length + 1,
      player1Id: player1.playerId,
      player2Id: player2?.playerId ?? null,
      player1Name: player1.playerName,
      player2Name: player2?.playerName ?? "BYE",
      player1: toBracketMatchPlayer(player1),
      player2: player2 ? toBracketMatchPlayer(player2) : null,
      goals1: null,
      goals2: null,
      pen1: null,
      pen2: null,
      penalties1: null,
      penalties2: null,
      winnerPlayerId: isBye ? player1.playerId : null,
      winnerId: isBye ? player1.playerId : null,
      loserId: null,
      draw: false,
      isFinished: isBye,
      status: isBye ? "finished" : "pending",
      isBye,
    });
  }

  return matches;
}

export function generatePesRepechageBracket(repechagePlayers: PesQualifiedPlayer[]): PesMatch[] {
  if (repechagePlayers.length < 2) return [];

  const remainingPlayers = [...repechagePlayers];
  const matches: PesMatch[] = [];

  while (remainingPlayers.length > 0) {
    const player1 = remainingPlayers.shift();
    if (!player1) break;

    const player2 = remainingPlayers.shift() ?? null;
    const isBye = player2 === null;

    matches.push({
      id: `pes-repechage-r1-${matches.length + 1}`,
      stage: "repechage",
      round: 1,
      groupId: null,
      groupLetter: player1.groupLetter,
      groupIndex: null,
      matchIndex: matches.length + 1,
      player1Id: player1.playerId,
      player2Id: player2?.playerId ?? null,
      player1Name: player1.playerName,
      player2Name: player2?.playerName ?? "BYE",
      player1: toBracketMatchPlayer(player1),
      player2: player2 ? toBracketMatchPlayer(player2) : null,
      goals1: null,
      goals2: null,
      pen1: null,
      pen2: null,
      penalties1: null,
      penalties2: null,
      winnerPlayerId: isBye ? player1.playerId : null,
      winnerId: isBye ? player1.playerId : null,
      loserId: null,
      draw: false,
      isFinished: isBye,
      status: isBye ? "finished" : "pending",
      isBye,
    });
  }

  return matches;
}

export function arePesGroupMatchesFinished(matches: PesMatch[]): boolean {
  const groupMatches = matches.filter((match) => match.stage === "group");
  return groupMatches.length > 0 && groupMatches.every((match) => match.status === "finished");
}

function withAdvancedByeStages(
  state: PesTournamentState,
  stages: Array<Extract<PesMatch["stage"], "final" | "repechage">>,
): PesTournamentState {
  return stages.reduce((currentState, stage) => {
    const firstRoundMatches = currentState.matches.filter((match) => match.stage === stage && match.round === 1);
    return firstRoundMatches.length > 0 && firstRoundMatches.every((match) => match.status === "finished")
      ? progressPesKnockoutRound(currentState, stage, 1)
      : currentState;
  }, state);
}

export function createPesFinalBracket(state: PesTournamentState, qualifiedPlayers: PesQualifiedPlayer[]): PesTournamentState {
  if (qualifiedPlayers.length === 0) return state;
  if (state.matches.some((match) => match.stage === "final")) return state;

  const matches = generatePesMainBracket(qualifiedPlayers);

  const nextState = {
    ...state,
    matches: [...state.matches, ...matches],
  };

  return withAdvancedByeStages(nextState, ["final"]);
}

export function createPesPostGroupStage(state: PesTournamentState): PesTournamentState {
  if (!arePesGroupMatchesFinished(state.matches)) return state;
  if (state.matches.some((match) => match.stage === "final" || match.stage === "repechage")) return state;

  const standings = calculatePesStandings(state.groups, state.matches, {
    useRepechage: state.useRepechage,
  });
  const { qualifiedPlayers, repechagePlayers } = getPesQualifiedPlayers(standings, state.useRepechage);
  const mainMatches = generatePesMainBracket(qualifiedPlayers);
  const repechageMatches = state.useRepechage ? generatePesRepechageBracket(repechagePlayers) : [];
  const nextState: PesTournamentState = {
    ...state,
    matches: [...state.matches, ...mainMatches, ...repechageMatches],
  };

  return withAdvancedByeStages(nextState, ["final", "repechage"]);
}

export function progressPesKnockoutRound(
  state: PesTournamentState,
  stage: Extract<PesMatch["stage"], "final" | "repechage">,
  round: number,
): PesTournamentState {
  const roundMatches = state.matches.filter((match) => match.stage === stage && match.round === round);
  if (roundMatches.length === 0) return state;
  if (!roundMatches.every((match) => match.status === "finished")) return state;

  const winnerIds = roundMatches.flatMap((match) => (match.winnerId ? [match.winnerId] : []));

  if (winnerIds.length <= 1) {
    const championPlayer = winnerIds[0] ? getChampionPlayer(state, winnerIds[0]) : null;
    if (!championPlayer) return state;

    return stage === "final"
      ? {
          ...state,
          champion: {
            ...championPlayer,
            stage,
          },
        }
      : {
          ...state,
          repechageChampion: {
            ...championPlayer,
            stage,
          },
        };
  }

  const nextRound = round + 1;
  if (state.matches.some((match) => match.stage === stage && match.round === nextRound)) return state;

  let nextId = state.matchIdCounter;
  const nextMatches: PesMatch[] = [];

  for (let index = 0; index < winnerIds.length; index += 2) {
    const player1 = getPlayerById(state.groups, winnerIds[index]);
    const player2 = winnerIds[index + 1] ? getPlayerById(state.groups, winnerIds[index + 1]) : null;

    if (!player1) continue;

    nextMatches.push(
      createPesMatch(stage, nextRound, nextMatches.length + 1, player1, player2, nextId, {
        id: `${stage}-round-${nextRound}`,
        letter: getPesRoundName(winnerIds.length),
      }),
    );
    nextId += 1;
  }

  const nextState = {
    ...state,
    matches: [...state.matches, ...nextMatches],
    matchIdCounter: nextId,
  };

  return nextMatches.every((match) => match.status === "finished")
    ? progressPesKnockoutRound(nextState, stage, nextRound)
    : nextState;
}

export function getPesRoundName(playerCount: number): string {
  if (playerCount >= 16) return "Oitavas de final";
  if (playerCount >= 8) return "Quartas de final";
  if (playerCount >= 4) return "Semifinal";
  if (playerCount === 2) return "Final";
  return "Mata-mata";
}
