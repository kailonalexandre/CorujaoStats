import { createPesMatch, toPesMatchPlayer } from "./pes.matches";
import type {
  PesChampion,
  PesChampionCheckResult,
  PesGroup,
  PesMatch,
  PesMatchPlayer,
  PesQualifiedPlayer,
  PesRepechageContext,
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

function getDirectQualifierIds(groups: PesGroup[]): string[] {
  return groups.flatMap((group) => group.players.slice(0, 2).map((player) => player.id));
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

export function generatePesMainBracket(qualifiedPlayers: PesQualifiedPlayer[]): PesMatch[] {
  const remainingPlayers = [...qualifiedPlayers];
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

export function createPesFinalBracket(
  state: PesTournamentState,
  qualifierIds: string[],
): PesTournamentState {
  if (qualifierIds.length === 0) return state;
  if (state.matches.some((match) => match.stage === "final")) return state;

  let nextId = state.matchIdCounter;
  const matches: PesMatch[] = [];
  const qualifierSet = new Set(qualifierIds);
  const groupIndexes = state.groups.map((_, index) => index);

  for (let index = 0; index + 1 < groupIndexes.length; index += 2) {
    const firstGroupIndex = groupIndexes[index];
    const secondGroupIndex = groupIndexes[index + 1];
    const firstGroup = state.groups[firstGroupIndex];
    const secondGroup = state.groups[secondGroupIndex];
    const firstQualifiers = firstGroup.players.filter((player) => qualifierSet.has(player.id));
    const secondQualifiers = secondGroup.players.filter((player) => qualifierSet.has(player.id));
    const maxLength = Math.max(firstQualifiers.length, secondQualifiers.length);

    for (let qualifierIndex = 0; qualifierIndex < maxLength; qualifierIndex += 1) {
      const player1 = firstQualifiers[qualifierIndex];
      const player2 = secondQualifiers[secondQualifiers.length - 1 - qualifierIndex];

      if (player1 || player2) {
        matches.push(
          createPesMatch(
            "final",
            1,
            matches.length + 1,
            toPesMatchPlayer(player1 ?? player2),
            player1 && player2 ? toPesMatchPlayer(player2) : null,
            nextId,
            {
              id: `${firstGroup.id}-${secondGroup.id}`,
              letter: `${firstGroup.letter}x${secondGroup.letter}`,
            },
          ),
        );
        nextId += 1;
      }
    }
  }

  if (groupIndexes.length % 2 !== 0) {
    const lastGroup = state.groups[groupIndexes[groupIndexes.length - 1]];

    lastGroup.players
      .filter((player) => qualifierSet.has(player.id))
      .forEach((player) => {
        matches.push(
          createPesMatch("final", 1, matches.length + 1, toPesMatchPlayer(player), null, nextId, lastGroup),
        );
        nextId += 1;
      });
  }

  const nextState = {
    ...state,
    matches: [...state.matches, ...matches],
    matchIdCounter: nextId,
  };

  return matches.every((match) => match.status === "finished")
    ? progressPesKnockoutRound(nextState, "final", 1)
    : nextState;
}

export function createPesPostGroupStage(state: PesTournamentState): PesTournamentState {
  if (!arePesGroupMatchesFinished(state.matches)) return state;
  if (state.matches.some((match) => match.stage === "final" || match.stage === "repechage")) return state;

  const directQualifierIds = getDirectQualifierIds(state.groups);
  const hasOddGroup = state.groups.some((group) => group.players.length % 2 !== 0);

  if (!state.useRepechage || !hasOddGroup) {
    return createPesFinalBracket(state, directQualifierIds);
  }

  const oddGroups = state.groups.filter((group) => group.players.length % 2 !== 0);
  const evenGroups = state.groups.filter((group) => group.players.length % 2 === 0);
  const pairCount = Math.min(oddGroups.length, evenGroups.length);
  const repechageMatches: PesMatch[] = [];
  const repechageContext: PesRepechageContext[] = [];
  let nextId = state.matchIdCounter;

  for (let index = 0; index < pairCount; index += 1) {
    const oddGroup = oddGroups[index];
    const evenGroup = evenGroups[index];
    const oddRunnerUp = oddGroup.players[1];
    const evenThirdPlace = evenGroup.players[2];

    if (!oddRunnerUp || !evenThirdPlace) continue;

    const match = createPesMatch(
      "repechage",
      1,
      repechageMatches.length + 1,
      toPesMatchPlayer(oddRunnerUp),
      toPesMatchPlayer(evenThirdPlace),
      nextId,
      {
        id: `${oddGroup.id}-${evenGroup.id}`,
        letter: `${oddGroup.letter}x${evenGroup.letter}`,
      },
    );

    repechageMatches.push(match);
    repechageContext.push({
      matchId: match.id,
      playerToReplaceIfLoseId: oddRunnerUp.id,
    });
    nextId += 1;
  }

  if (repechageMatches.length === 0) {
    return createPesFinalBracket(state, directQualifierIds);
  }

  return {
    ...state,
    matches: [...state.matches, ...repechageMatches],
    matchIdCounter: nextId,
    repechageContext,
  };
}

export function completePesRepechage(state: PesTournamentState): PesTournamentState {
  const repechageMatches = state.matches.filter((match) => match.stage === "repechage" && match.round === 1);
  if (repechageMatches.length === 0) return state;
  if (!repechageMatches.every((match) => match.status === "finished")) return state;
  if (state.matches.some((match) => match.stage === "final")) return state;

  const qualifierIds = getDirectQualifierIds(state.groups);

  repechageMatches.forEach((match) => {
    const context = state.repechageContext.find((item) => item.matchId === match.id);
    if (!context || !match.winnerId) return;

    if (match.winnerId !== match.player1.id) {
      const replaceIndex = qualifierIds.indexOf(context.playerToReplaceIfLoseId);
      if (replaceIndex !== -1) qualifierIds[replaceIndex] = match.winnerId;
    }
  });

  return createPesFinalBracket(state, Array.from(new Set(qualifierIds)));
}

export function progressPesKnockoutRound(
  state: PesTournamentState,
  stage: Extract<PesMatch["stage"], "final" | "repechage">,
  round: number,
): PesTournamentState {
  if (stage === "repechage") return completePesRepechage(state);

  const roundMatches = state.matches.filter((match) => match.stage === stage && match.round === round);
  if (roundMatches.length === 0) return state;
  if (!roundMatches.every((match) => match.status === "finished")) return state;

  const winnerIds = roundMatches.flatMap((match) => (match.winnerId ? [match.winnerId] : []));

  if (winnerIds.length <= 1) {
    const championPlayer = winnerIds[0] ? getChampionPlayer(state, winnerIds[0]) : null;
    return championPlayer
      ? {
          ...state,
          champion: {
            ...championPlayer,
            name: championPlayer.name,
            stage,
          },
        }
      : state;
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
