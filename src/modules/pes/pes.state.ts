import { calculatePesStandings } from "./pes.standings";
import type {
  PesChampion,
  PesGroup,
  PesGroupStanding,
  PesMatch,
  PesStanding,
  PesTournamentState,
  PesUiGameState,
  PesUiGroup,
  PesUiMatch,
  PesUiPlayer,
} from "./pes.types";

type PesGameStateInput =
  | PesTournamentState
  | {
      id?: string;
      name?: string;
      groupData?: PesGroup[];
      matchData?: PesMatch[];
      groups?: PesGroup[];
      matches?: PesMatch[];
      standings?: PesGroupStanding[] | PesStanding[];
      useRepechage?: boolean;
      champion?: PesChampion | null;
      repechageChampion?: PesChampion | null;
      updatedAt?: Date;
    };

function getGroups(input: PesGameStateInput): PesGroup[] {
  if ("groupData" in input && input.groupData) return input.groupData;
  if ("groups" in input && input.groups) return input.groups;
  return [];
}

function getMatches(input: PesGameStateInput): PesMatch[] {
  if ("matchData" in input && input.matchData) return input.matchData;
  if ("matches" in input && input.matches) return input.matches;
  return [];
}

function getProvidedGroupedStandings(input: PesGameStateInput): PesGroupStanding[] | null {
  if (!("standings" in input) || !input.standings || input.standings.length === 0) return null;

  const [firstStanding] = input.standings;
  return "players" in firstStanding ? (input.standings as PesGroupStanding[]) : null;
}

function getParticipantMap(groups: PesGroup[]) {
  return new Map(groups.flatMap((group) => group.players.map((player) => [player.id, player] as const)));
}

function toUiPlayer(player: PesGroupStanding["players"][number]): PesUiPlayer {
  return {
    id: player.playerId,
    name: player.playerName,
    nickname: player.nickname,
    photoUrl: player.photoUrl,
    teamId: player.teamId,
    teamName: player.teamName,
    points: player.points,
    wins: player.wins,
    draws: player.draws,
    losses: player.losses,
    goalsFor: player.goalsFor,
    goalsAgainst: player.goalsAgainst,
    goalDifference: player.goalDifference,
    position: player.position,
    qualified: player.qualified,
    repechageEligible: player.repechageEligible,
  };
}

function toUiMatch(match: PesMatch, playersById: ReturnType<typeof getParticipantMap>): PesUiMatch {
  const player1 = playersById.get(match.player1Id ?? match.player1.id);
  const player2 = match.player2Id ? playersById.get(match.player2Id) : null;
  const winnerPlayer = match.winnerPlayerId ? playersById.get(match.winnerPlayerId) : null;

  return {
    id: match.id,
    stage: match.stage,
    round: match.round,
    group: match.groupLetter ?? null,
    groupIndex: match.groupIndex ?? null,
    matchIndex: match.matchIndex,
    player1: match.player1Name,
    player2: match.player2Name,
    player1PhotoUrl: player1?.photoUrl ?? null,
    player2PhotoUrl: player2?.photoUrl ?? null,
    player1Team: player1?.team?.name ?? player1?.teamName ?? match.player1.team?.name ?? null,
    player2Team: player2?.team?.name ?? player2?.teamName ?? match.player2?.team?.name ?? null,
    goals1: match.goals1,
    goals2: match.goals2,
    pen1: match.pen1,
    pen2: match.pen2,
    winner: winnerPlayer?.name ?? null,
    draw: match.draw,
    isFinished: match.isFinished,
  };
}

export function getPesGameState(input: PesGameStateInput): PesUiGameState {
  const groups = getGroups(input);
  const matches = getMatches(input);
  const providedStandings = getProvidedGroupedStandings(input);
  const standings: PesGroupStanding[] = providedStandings
    ? providedStandings
    : calculatePesStandings(groups, matches, {
        useRepechage: Boolean(input.useRepechage),
      });
  const playersById = getParticipantMap(groups);
  const standingsByGroupId = new Map(standings.map((groupStanding) => [groupStanding.groupId, groupStanding]));

  const groupData: PesUiGroup[] = groups.map((group) => ({
    id: group.id,
    letter: group.letter,
    players: (standingsByGroupId.get(group.id)?.players ?? []).map(toUiPlayer),
  }));

  return {
    id: "id" in input && input.id ? input.id : "pes",
    name: "name" in input && input.name ? input.name : "PES",
    gameType: "pes",
    groupData,
    matchData: matches.map((match) => toUiMatch(match, playersById)),
    standings,
    useRepechage: Boolean(input.useRepechage),
    champion: input.champion ?? null,
    repechageChampion: input.repechageChampion ?? null,
    updatedAt: "updatedAt" in input && input.updatedAt ? input.updatedAt : new Date(),
  };
}
