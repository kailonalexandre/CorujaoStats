import { GameItemType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { DEFAULT_GROUP_ID, ensureDefaultGroup } from "@/lib/db/players";

import { drawPesGroups } from "./pes.draw";
import { generatePesGroupMatches } from "./pes.matches";
import { updatePesGroupMatchScore, updatePesKnockoutMatchScore } from "./pes.score";
import { calculatePesStandings } from "./pes.standings";
import { getPesGameState } from "./pes.state";
import type {
  PesChampion,
  PesGroup,
  PesGroupStanding,
  PesMatch,
  PesMatchPlayer,
  PesParticipant,
  PesTeamInput,
  PesTournamentState,
  PesUiGameState,
} from "./pes.types";

type DbClient = typeof prisma | Prisma.TransactionClient;

type PesSessionRecord = Prisma.PesGameSessionGetPayload<{
  include: {
    groups: true;
    participants: {
      include: {
        player: true;
        teamItem: true;
      };
    };
    matches: true;
    championPlayer: true;
    repechageChampionPlayer: true;
  };
}>;

export type CreatePesGameInput = {
  playerIds: string[];
  numberOfGroups: number;
  useRepechage?: boolean;
  name?: string;
  groupId?: string;
};

export type CreatePesGameSessionInput = {
  name?: string;
  useRepechage?: boolean;
  groupId?: string;
};

export type SortPesGameInput = {
  sessionId: string;
  playerIds: string[];
  numberOfGroups: number;
  useRepechage?: boolean;
  groupId?: string;
};

export type UpdatePesGroupScoreInput = {
  sessionId?: string;
  matchId: string;
  goals1: number;
  goals2: number;
  groupId?: string;
};

export type UpdatePesKnockoutScoreInput = UpdatePesGroupScoreInput & {
  pen1?: number | null;
  pen2?: number | null;
};

export type UpdatePesScoreInput = UpdatePesKnockoutScoreInput;

const PES_GAME_SLUG = "pes";

function toPesTeam(teamItem: { id: string; name: string } | null): PesTeamInput | null {
  return teamItem
    ? {
        id: teamItem.id,
        name: teamItem.name,
      }
    : null;
}

function makeEmptyParticipant(
  player: {
    id: string;
    name: string;
    nickname: string | null;
    photoUrl: string | null;
  },
  team: PesTeamInput | null,
): PesParticipant {
  return {
    id: player.id,
    name: player.name,
    nickname: player.nickname,
    photoUrl: player.photoUrl,
    teamId: team?.id ?? null,
    teamName: team?.name ?? null,
    team,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
  };
}

function toMatchPlayer(participant: PesParticipant | undefined, fallbackName: string): PesMatchPlayer {
  return {
    id: participant?.id ?? "",
    name: participant?.name ?? fallbackName,
    team: participant?.team ?? null,
  };
}

function findChampion(
  state: PesTournamentState,
  playerId: string | null,
  stage: "final" | "repechage",
): PesChampion | null {
  if (!playerId) return null;

  const participant = state.groups.flatMap((group) => group.players).find((player) => player.id === playerId);
  if (!participant) return null;

  return {
    playerId: participant.id,
    name: participant.name,
    nickname: participant.nickname,
    photoUrl: participant.photoUrl,
    teamName: participant.team?.name ?? participant.teamName ?? null,
    team: participant.team,
    stage,
  };
}

function hydrateStateChampions(state: PesTournamentState): PesTournamentState {
  return {
    ...state,
    champion: findChampion(state, state.champion?.playerId ?? null, "final"),
    repechageChampion: findChampion(state, state.repechageChampion?.playerId ?? null, "repechage"),
  };
}

function nextMatchIdCounter(matches: PesMatch[]): number {
  const counters = matches
    .map((match) => Number(match.id.replace("pes-match-", "")))
    .filter((counter) => Number.isInteger(counter) && counter > 0);

  return counters.length > 0 ? Math.max(...counters) + 1 : 1;
}

async function getPesGame(db: DbClient = prisma) {
  const game = await db.game.findUnique({
    where: {
      slug: PES_GAME_SLUG,
    },
  });

  if (!game) {
    throw new Error("Jogo PES nao encontrado. Cadastre o jogo PES antes de iniciar o torneio.");
  }

  return game;
}

async function getActivePesSession(groupId: string, sessionId?: string) {
  const game = await getPesGame();

  return prisma.pesGameSession.findFirst({
    where: {
      id: sessionId,
      gameId: game.id,
      groupId,
      active: true,
    },
    include: {
      groups: true,
      participants: {
        include: {
          player: true,
          teamItem: true,
        },
      },
      matches: true,
      championPlayer: true,
      repechageChampionPlayer: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

async function getPesSessionById(sessionId: string, groupId = DEFAULT_GROUP_ID) {
  const game = await getPesGame();

  return prisma.pesGameSession.findFirst({
    where: {
      id: sessionId,
      gameId: game.id,
      groupId,
      active: true,
    },
    include: {
      groups: true,
      participants: {
        include: {
          player: true,
          teamItem: true,
        },
      },
      matches: true,
      championPlayer: true,
      repechageChampionPlayer: true,
    },
  });
}

function toTournamentState(session: PesSessionRecord): PesTournamentState {
  const participantsByPlayerId = new Map(
    session.participants.map((participant) => {
      const team = toPesTeam(participant.teamItem);
      return [participant.playerId, makeEmptyParticipant(participant.player, team)] as const;
    }),
  );

  const groupRows = [...session.groups].sort((first, second) => first.groupIndex - second.groupIndex);
  const groups: PesGroup[] = groupRows.map((groupRow) => {
    const groupPlayers = session.participants
      .filter((participant) => participant.groupLetter === groupRow.letter)
      .sort((first, second) => {
        if (first.position !== null && second.position !== null) return first.position - second.position;
        return first.player.name.localeCompare(second.player.name);
      })
      .map((participant) => participantsByPlayerId.get(participant.playerId))
      .filter((participant): participant is PesParticipant => Boolean(participant));

    return {
      id: groupRow.stateGroupId,
      letter: groupRow.letter,
      players: groupPlayers,
    };
  });

  const matches: PesMatch[] = [...session.matches]
    .sort((first, second) => {
      if (first.stage !== second.stage) return first.stage.localeCompare(second.stage);
      if (first.round !== second.round) return first.round - second.round;
      return first.matchIndex - second.matchIndex;
    })
    .map((matchRow) => {
      const player1 = toMatchPlayer(participantsByPlayerId.get(matchRow.player1Id ?? ""), matchRow.player1Name);
      const player2Participant = matchRow.player2Id ? participantsByPlayerId.get(matchRow.player2Id) : undefined;
      const player2 = matchRow.player2Id ? toMatchPlayer(player2Participant, matchRow.player2Name) : null;
      const isBye = !matchRow.player2Id && matchRow.player2Name === "BYE";

      return {
        id: matchRow.id,
        stage: matchRow.stage,
        round: matchRow.round,
        groupId: matchRow.stateGroupId,
        groupLetter: matchRow.groupLetter,
        groupIndex: matchRow.groupIndex,
        matchIndex: matchRow.matchIndex,
        player1Id: matchRow.player1Id,
        player2Id: matchRow.player2Id,
        player1Name: matchRow.player1Name,
        player2Name: matchRow.player2Name,
        player1,
        player2,
        goals1: matchRow.goals1,
        goals2: matchRow.goals2,
        pen1: matchRow.pen1,
        pen2: matchRow.pen2,
        penalties1: matchRow.pen1,
        penalties2: matchRow.pen2,
        winnerPlayerId: matchRow.winnerPlayerId,
        winnerId: matchRow.winnerPlayerId,
        loserId: null,
        draw: matchRow.draw,
        isFinished: matchRow.isFinished,
        status: matchRow.isFinished ? "finished" : matchRow.draw ? "draw_needs_penalties" : "pending",
        isBye,
      };
    });

  const stateWithoutChampions: PesTournamentState = {
    groups,
    matches,
    matchIdCounter: session.matchIdCounter || nextMatchIdCounter(matches),
    useRepechage: session.useRepechage,
    repechageContext: [],
    champion: null,
    repechageChampion: null,
  };

  return {
    ...stateWithoutChampions,
    champion: findChampion(stateWithoutChampions, session.championPlayerId, "final"),
    repechageChampion: findChampion(stateWithoutChampions, session.repechageChampionPlayerId, "repechage"),
  };
}

function stateToUi(session: Pick<PesSessionRecord, "id" | "name" | "updatedAt">, state: PesTournamentState): PesUiGameState {
  return getPesGameState({
    id: session.id,
    name: session.name,
    groups: state.groups,
    matches: state.matches,
    useRepechage: state.useRepechage,
    champion: state.champion,
    repechageChampion: state.repechageChampion,
    updatedAt: session.updatedAt,
  });
}

async function syncPesState(db: Prisma.TransactionClient, sessionId: string, state: PesTournamentState) {
  const standings = calculatePesStandings(state.groups, state.matches, {
    useRepechage: state.useRepechage,
  });
  const standingsByPlayerId = new Map(
    standings.flatMap((groupStanding) =>
      groupStanding.players.map((player) => [player.playerId, player] as const),
    ),
  );

  await db.pesGameStanding.deleteMany({ where: { sessionId } });
  await db.pesGameMatch.deleteMany({ where: { sessionId } });
  await db.pesGameParticipant.deleteMany({ where: { sessionId } });
  await db.pesGameGroup.deleteMany({ where: { sessionId } });

  if (state.groups.length > 0) {
    await db.pesGameGroup.createMany({
      data: state.groups.map((group, index) => ({
        sessionId,
        stateGroupId: group.id,
        letter: group.letter,
        groupIndex: index,
      })),
    });
  }

  const participants = state.groups.flatMap((group, groupIndex) =>
    group.players.map((player) => ({
      sessionId,
      playerId: player.id,
      teamItemId: player.team?.id ?? player.teamId ?? null,
      groupLetter: group.letter,
      groupIndex,
      position: standingsByPlayerId.get(player.id)?.position ?? null,
    })),
  );

  if (participants.length > 0) {
    await db.pesGameParticipant.createMany({
      data: participants,
    });
  }

  if (state.matches.length > 0) {
    await db.pesGameMatch.createMany({
      data: state.matches.map((match) => ({
        id: match.id,
        sessionId,
        stage: match.stage,
        round: match.round,
        stateGroupId: match.groupId,
        groupLetter: match.groupLetter ?? null,
        groupIndex: match.groupIndex ?? null,
        matchIndex: match.matchIndex,
        player1Id: match.player1Id ?? match.player1.id,
        player2Id: match.player2Id ?? match.player2?.id ?? null,
        player1Name: match.player1Name,
        player2Name: match.player2Name,
        goals1: match.goals1,
        goals2: match.goals2,
        pen1: match.pen1,
        pen2: match.pen2,
        winnerPlayerId: match.winnerPlayerId,
        draw: match.draw,
        isFinished: match.isFinished,
      })),
    });
  }

  const standingRows = standings.flatMap((groupStanding: PesGroupStanding) =>
    groupStanding.players.map((player) => ({
      sessionId,
      playerId: player.playerId,
      groupLetter: groupStanding.groupLetter,
      position: player.position,
      points: player.points,
      wins: player.wins,
      draws: player.draws,
      losses: player.losses,
      goalsFor: player.goalsFor,
      goalsAgainst: player.goalsAgainst,
      goalDifference: player.goalDifference,
      qualified: player.qualified,
      repechageEligible: player.repechageEligible,
    })),
  );

  if (standingRows.length > 0) {
    await db.pesGameStanding.createMany({
      data: standingRows,
    });
  }

  return db.pesGameSession.update({
    where: {
      id: sessionId,
    },
    data: {
      useRepechage: state.useRepechage,
      matchIdCounter: state.matchIdCounter,
      championPlayerId: state.champion?.playerId ?? null,
      repechageChampionPlayerId: state.repechageChampion?.playerId ?? null,
    },
  });
}

export async function createPesGameSession(input: CreatePesGameSessionInput = {}): Promise<PesUiGameState> {
  const groupId = input.groupId ?? DEFAULT_GROUP_ID;
  await ensureDefaultGroup();

  return prisma.$transaction(async (db) => {
    const game = await getPesGame(db);

    await db.pesGameSession.updateMany({
      where: {
        gameId: game.id,
        groupId,
        active: true,
      },
      data: {
        active: false,
      },
    });

    const session = await db.pesGameSession.create({
      data: {
        name: input.name ?? "PES",
        gameId: game.id,
        groupId,
        useRepechage: Boolean(input.useRepechage),
        matchIdCounter: 1,
      },
    });

    const state: PesTournamentState = {
      groups: [],
      matches: [],
      matchIdCounter: 1,
      useRepechage: Boolean(input.useRepechage),
      repechageContext: [],
      champion: null,
      repechageChampion: null,
    };

    return stateToUi(session, state);
  });
}

export async function listActivePesGameStates(groupId = DEFAULT_GROUP_ID): Promise<PesUiGameState[]> {
  const game = await getPesGame();
  const sessions = await prisma.pesGameSession.findMany({
    where: {
      gameId: game.id,
      groupId,
      active: true,
    },
    include: {
      groups: true,
      participants: {
        include: {
          player: true,
          teamItem: true,
        },
      },
      matches: true,
      championPlayer: true,
      repechageChampionPlayer: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return sessions.map((session) => stateToUi(session, toTournamentState(session)));
}

export async function getPesGameStateById(
  sessionId: string,
  groupId = DEFAULT_GROUP_ID,
): Promise<PesUiGameState | null> {
  const session = await getPesSessionById(sessionId, groupId);
  if (!session) return null;

  return stateToUi(session, toTournamentState(session));
}

export async function sortPesGame(input: SortPesGameInput): Promise<PesUiGameState> {
  const groupId = input.groupId ?? DEFAULT_GROUP_ID;
  await ensureDefaultGroup();

  return prisma.$transaction(async (db) => {
    const game = await getPesGame(db);
    const session = await db.pesGameSession.findFirst({
      where: {
        id: input.sessionId,
        gameId: game.id,
        groupId,
        active: true,
      },
    });

    if (!session) {
      throw new Error("Jogo ativo de PES nao encontrado.");
    }

    const players = await db.player.findMany({
      where: {
        id: {
          in: input.playerIds,
        },
        groupId,
      },
      orderBy: {
        name: "asc",
      },
    });

    if (players.length !== input.playerIds.length) {
      throw new Error("Alguns jogadores selecionados nao foram encontrados neste grupo.");
    }

    const teams = await db.gameItem.findMany({
      where: {
        gameId: game.id,
        type: GameItemType.team,
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const drawResult = drawPesGroups({
      players: input.playerIds.map((playerId) => {
        const player = players.find((candidate) => candidate.id === playerId);
        if (!player) throw new Error("Jogador selecionado nao encontrado.");

        return {
          id: player.id,
          name: player.name,
          nickname: player.nickname,
          photoUrl: player.photoUrl,
        };
      }),
      numberOfGroups: input.numberOfGroups,
      availableTeams: teams.map((team) => ({
        id: team.id,
        name: team.name,
      })),
      useRepechage: input.useRepechage ?? session.useRepechage,
    });

    if (!drawResult.ok) {
      throw new Error(drawResult.error);
    }

    const matches = generatePesGroupMatches(drawResult.groupData);
    const state: PesTournamentState = {
      groups: drawResult.groupData,
      matches,
      matchIdCounter: nextMatchIdCounter(matches),
      useRepechage: drawResult.useRepechage,
      repechageContext: [],
      champion: null,
      repechageChampion: null,
    };

    const updatedSession = await syncPesState(db, session.id, state);

    return stateToUi(updatedSession, state);
  });
}

export async function createPesGame(input: CreatePesGameInput): Promise<PesUiGameState> {
  const groupId = input.groupId ?? DEFAULT_GROUP_ID;
  await ensureDefaultGroup();

  return prisma.$transaction(async (db) => {
    const game = await getPesGame(db);
    const players = await db.player.findMany({
      where: {
        id: {
          in: input.playerIds,
        },
        groupId,
      },
      orderBy: {
        name: "asc",
      },
    });

    if (players.length !== input.playerIds.length) {
      throw new Error("Alguns jogadores selecionados nao foram encontrados neste grupo.");
    }

    const teams = await db.gameItem.findMany({
      where: {
        gameId: game.id,
        type: GameItemType.team,
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const drawResult = drawPesGroups({
      players: input.playerIds.map((playerId) => {
        const player = players.find((candidate) => candidate.id === playerId);
        if (!player) throw new Error("Jogador selecionado nao encontrado.");

        return {
          id: player.id,
          name: player.name,
          nickname: player.nickname,
          photoUrl: player.photoUrl,
        };
      }),
      numberOfGroups: input.numberOfGroups,
      availableTeams: teams.map((team) => ({
        id: team.id,
        name: team.name,
      })),
      useRepechage: Boolean(input.useRepechage),
    });

    if (!drawResult.ok) {
      throw new Error(drawResult.error);
    }

    await db.pesGameSession.updateMany({
      where: {
        gameId: game.id,
        groupId,
        active: true,
      },
      data: {
        active: false,
      },
    });

    const matches = generatePesGroupMatches(drawResult.groupData);
    const state: PesTournamentState = {
      groups: drawResult.groupData,
      matches,
      matchIdCounter: nextMatchIdCounter(matches),
      useRepechage: drawResult.useRepechage,
      repechageContext: [],
      champion: null,
      repechageChampion: null,
    };

    const session = await db.pesGameSession.create({
      data: {
        name: input.name ?? "PES",
        gameId: game.id,
        groupId,
        useRepechage: state.useRepechage,
        matchIdCounter: state.matchIdCounter,
      },
    });

    const updatedSession = await syncPesState(db, session.id, state);

    return stateToUi(updatedSession, state);
  });
}

export async function getActivePesGameState(groupId = DEFAULT_GROUP_ID): Promise<PesUiGameState | null> {
  const session = await getActivePesSession(groupId);
  if (!session) return null;

  const state = toTournamentState(session);
  return stateToUi(session, state);
}

export async function updatePesPersistedGroupMatchScore(
  input: UpdatePesGroupScoreInput,
): Promise<PesUiGameState> {
  const groupId = input.groupId ?? DEFAULT_GROUP_ID;
  const session = await getActivePesSession(groupId, input.sessionId);
  if (!session) {
    throw new Error("Jogo ativo de PES nao encontrado.");
  }

  const currentState = toTournamentState(session);
  const nextState = hydrateStateChampions(updatePesGroupMatchScore({
    gameState: currentState,
    matchId: input.matchId,
    goals1: input.goals1,
    goals2: input.goals2,
  }));

  const updatedSession = await prisma.$transaction((db) => syncPesState(db, session.id, nextState));

  return stateToUi(updatedSession, nextState);
}

export async function updatePesPersistedKnockoutMatchScore(
  input: UpdatePesKnockoutScoreInput,
): Promise<PesUiGameState> {
  const groupId = input.groupId ?? DEFAULT_GROUP_ID;
  const session = await getActivePesSession(groupId, input.sessionId);
  if (!session) {
    throw new Error("Jogo ativo de PES nao encontrado.");
  }

  const currentState = toTournamentState(session);
  const nextState = hydrateStateChampions(updatePesKnockoutMatchScore({
    gameState: currentState,
    matchId: input.matchId,
    goals1: input.goals1,
    goals2: input.goals2,
    pen1: input.pen1,
    pen2: input.pen2,
  }));

  const updatedSession = await prisma.$transaction((db) => syncPesState(db, session.id, nextState));

  return stateToUi(updatedSession, nextState);
}

export async function updatePesPersistedMatchScore(input: UpdatePesScoreInput): Promise<PesUiGameState> {
  const groupId = input.groupId ?? DEFAULT_GROUP_ID;
  const session = await getActivePesSession(groupId, input.sessionId);
  if (!session) {
    throw new Error("Jogo ativo de PES nao encontrado.");
  }

  const currentState = toTournamentState(session);
  const match = currentState.matches.find((candidate) => candidate.id === input.matchId);
  if (!match) {
    throw new Error("Partida nao encontrada.");
  }

  const nextState = hydrateStateChampions(
    match.stage === "group"
      ? updatePesGroupMatchScore({
          gameState: currentState,
          matchId: input.matchId,
          goals1: input.goals1,
          goals2: input.goals2,
        })
      : updatePesKnockoutMatchScore({
          gameState: currentState,
          matchId: input.matchId,
          goals1: input.goals1,
          goals2: input.goals2,
          pen1: input.pen1,
          pen2: input.pen2,
        }),
  );

  const updatedSession = await prisma.$transaction((db) => syncPesState(db, session.id, nextState));

  return stateToUi(updatedSession, nextState);
}

export async function resetActivePesGame(groupId = DEFAULT_GROUP_ID): Promise<PesUiGameState | null> {
  const session = await getActivePesSession(groupId);
  if (!session) return null;

  await prisma.$transaction(async (db) => {
    await db.pesGameStanding.deleteMany({ where: { sessionId: session.id } });
    await db.pesGameMatch.deleteMany({ where: { sessionId: session.id } });
    await db.pesGameParticipant.deleteMany({ where: { sessionId: session.id } });
    await db.pesGameGroup.deleteMany({ where: { sessionId: session.id } });
    await db.pesGameSession.update({
      where: {
        id: session.id,
      },
      data: {
        useRepechage: false,
        matchIdCounter: 1,
        championPlayerId: null,
        repechageChampionPlayerId: null,
      },
    });
  });

  const cleanSession = await getActivePesSession(groupId, session.id);
  if (!cleanSession) return null;

  return stateToUi(cleanSession, toTournamentState(cleanSession));
}

export async function resetPesGameById(sessionId: string, groupId = DEFAULT_GROUP_ID): Promise<PesUiGameState | null> {
  const session = await getPesSessionById(sessionId, groupId);
  if (!session) return null;

  await prisma.$transaction(async (db) => {
    await db.pesGameStanding.deleteMany({ where: { sessionId: session.id } });
    await db.pesGameMatch.deleteMany({ where: { sessionId: session.id } });
    await db.pesGameParticipant.deleteMany({ where: { sessionId: session.id } });
    await db.pesGameGroup.deleteMany({ where: { sessionId: session.id } });
    await db.pesGameSession.update({
      where: {
        id: session.id,
      },
      data: {
        useRepechage: false,
        matchIdCounter: 1,
        championPlayerId: null,
        repechageChampionPlayerId: null,
      },
    });
  });

  const cleanSession = await getPesSessionById(session.id, groupId);
  if (!cleanSession) return null;

  return stateToUi(cleanSession, toTournamentState(cleanSession));
}
