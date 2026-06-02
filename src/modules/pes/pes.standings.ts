import type {
  PesGroup,
  PesGroupStanding,
  PesMatch,
  PesParticipant,
  PesQualifiedPlayer,
  PesQualifiedPlayersResult,
  PesStandingRow,
  PesStandingsOptions,
} from "./pes.types";

function resetParticipantStats(player: PesParticipant): PesParticipant {
  return {
    ...player,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
  };
}

function sortPesParticipants(players: PesParticipant[]): PesParticipant[] {
  return [...players].sort((first, second) => {
    if (second.points !== first.points) return second.points - first.points;
    if (second.wins !== first.wins) return second.wins - first.wins;
    if (second.goalDifference !== first.goalDifference) return second.goalDifference - first.goalDifference;
    if (second.goalsFor !== first.goalsFor) return second.goalsFor - first.goalsFor;
    if (first.goalsAgainst !== second.goalsAgainst) return first.goalsAgainst - second.goalsAgainst;
    return first.name.localeCompare(second.name);
  });
}

export function calculatePesStandings(
  groupData: PesGroup[],
  matchData: PesMatch[],
  options: PesStandingsOptions = {},
): PesGroupStanding[] {
  const groupsById = new Map<string, PesGroup>();

  const recalculatedGroups = groupData.map((group) => {
    const cleanGroup = {
      ...group,
      players: group.players.map(resetParticipantStats),
    };
    groupsById.set(cleanGroup.id, cleanGroup);
    return cleanGroup;
  });

  matchData
    .filter(
      (match) =>
        match.stage === "group" &&
        match.status === "finished" &&
        !match.isBye &&
        match.groupId !== null &&
        match.player2 !== null &&
        match.goals1 !== null &&
        match.goals2 !== null,
    )
    .forEach((match) => {
      const group = groupsById.get(match.groupId as string);
      if (!group || !match.player2 || match.goals1 === null || match.goals2 === null) return;

      const player1 = group.players.find((player) => player.id === match.player1.id);
      const player2 = group.players.find((player) => player.id === match.player2?.id);
      if (!player1 || !player2) return;

      player1.goalsFor += match.goals1;
      player1.goalsAgainst += match.goals2;
      player1.goalDifference = player1.goalsFor - player1.goalsAgainst;

      player2.goalsFor += match.goals2;
      player2.goalsAgainst += match.goals1;
      player2.goalDifference = player2.goalsFor - player2.goalsAgainst;

      if (match.goals1 > match.goals2) {
        player1.points += 3;
        player1.wins += 1;
        player2.losses += 1;
      } else if (match.goals2 > match.goals1) {
        player2.points += 3;
        player2.wins += 1;
        player1.losses += 1;
      } else {
        player1.points += 1;
        player2.points += 1;
        player1.draws += 1;
        player2.draws += 1;
      }
    });

  return recalculatedGroups.map((group) => {
    const sortedPlayers = sortPesParticipants(group.players);
    const mainQualifierCount = Math.ceil(group.players.length / 2);

    return {
      groupId: group.id,
      groupLetter: group.letter,
      players: sortedPlayers.map((player, index) => ({
        ...player,
        playerId: player.id,
        playerName: player.name,
        photoUrl: player.photoUrl,
        teamName: player.team?.name ?? player.teamName ?? null,
        position: index + 1,
        groupId: group.id,
        groupLetter: group.letter,
        qualified: index < mainQualifierCount,
        repechageEligible: Boolean(options.useRepechage) && index >= mainQualifierCount,
      })),
    };
  });
}

export function recalculatePesStandings(groups: PesGroup[], matches: PesMatch[]): PesGroup[] {
  const standingsByGroupId = new Map(
    calculatePesStandings(groups, matches).map((groupStanding) => [
      groupStanding.groupId,
      groupStanding.players,
    ]),
  );

  return groups.map((group) => ({
    ...group,
    players: standingsByGroupId.get(group.id) ?? group.players,
  }));
}

export function getPesStandings(groups: PesGroup[]): PesStandingRow[] {
  return groups.flatMap((group) =>
    group.players.map((player, index) => {
      const mainQualifierCount = Math.ceil(group.players.length / 2);

      return {
        ...player,
        playerId: player.id,
        playerName: player.name,
        photoUrl: player.photoUrl,
        teamName: player.team?.name ?? player.teamName ?? null,
        position: index + 1,
        groupId: group.id,
        groupLetter: group.letter,
        qualified: index < mainQualifierCount,
        repechageEligible: false,
      };
    }),
  );
}

function toQualifiedPlayer(player: PesStandingRow): PesQualifiedPlayer {
  return {
    playerId: player.playerId,
    playerName: player.playerName,
    photoUrl: player.photoUrl,
    teamName: player.teamName,
    groupLetter: player.groupLetter,
    position: player.position,
  };
}

export function getPesQualifiedPlayers(
  standingsByGroup: PesGroupStanding[],
  useRepechage: boolean,
): PesQualifiedPlayersResult {
  return standingsByGroup.reduce<PesQualifiedPlayersResult>(
    (result, groupStanding) => {
      const qualifierCount = Math.ceil(groupStanding.players.length / 2);

      groupStanding.players.forEach((player, index) => {
        if (index < qualifierCount) {
          result.qualifiedPlayers.push(toQualifiedPlayer(player));
          return;
        }

        if (useRepechage) {
          result.repechagePlayers.push(toQualifiedPlayer(player));
        }
      });

      return result;
    },
    {
      qualifiedPlayers: [],
      repechagePlayers: [],
    },
  );
}
