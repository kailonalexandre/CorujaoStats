import type {
  PesDrawGroupsInput,
  PesDrawGroupsResult,
  PesParticipant,
  PesPlayerInput,
  PesRandom,
  PesTeamInput,
  PesTournamentOptions,
} from "./pes.types";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function shufflePesItems<T>(items: T[], random: PesRandom = Math.random): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
}

export function createPesParticipant(player: PesPlayerInput, team: PesTeamInput | null): PesParticipant {
  return {
    id: player.id,
    name: player.name,
    nickname: player.nickname ?? null,
    photoUrl: player.photoUrl ?? null,
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

export function drawPesTeams(
  players: PesPlayerInput[],
  teams: PesTeamInput[],
  options: Pick<PesTournamentOptions, "allowTeamReuse" | "random"> = {},
): PesParticipant[] {
  if (players.length === 0) return [];
  if (teams.length === 0) return players.map((player) => createPesParticipant(player, null));

  if (!options.allowTeamReuse && teams.length < players.length) {
    throw new Error("Nao ha times suficientes para sortear sem repeticao.");
  }

  const shuffledTeams = shufflePesItems(teams, options.random);

  return players.map((player, index) =>
    createPesParticipant(player, shuffledTeams[index % shuffledTeams.length] ?? null),
  );
}

export function drawPesGroups(
  input: PesDrawGroupsInput,
): PesDrawGroupsResult {
  const { players, numberOfGroups, availableTeams, useRepechage = false, random } = input;

  if (!Number.isInteger(numberOfGroups) || numberOfGroups < 1) {
    return {
      ok: false,
      error: "Informe uma quantidade de grupos maior que zero.",
      groupData: [],
      useRepechage,
    };
  }

  if (players.length < numberOfGroups) {
    return {
      ok: false,
      error: "E necessario ter pelo menos o mesmo numero de jogadores que grupos.",
      groupData: [],
      useRepechage,
    };
  }

  if (availableTeams.length < players.length) {
    return {
      ok: false,
      error: "Nao ha times do PES suficientes para sortear sem repetir. Cadastre mais times antes do sorteio.",
      groupData: [],
      useRepechage,
    };
  }

  const shuffledPlayers = shufflePesItems(players, random);
  const participants = drawPesTeams(shuffledPlayers, availableTeams, {
    allowTeamReuse: false,
    random,
  });
  const basePerGroup = Math.floor(participants.length / numberOfGroups);
  let extraPlayers = participants.length % numberOfGroups;
  let currentIndex = 0;

  const groupData = Array.from({ length: numberOfGroups }, (_, index) => {
    const playersInGroup = basePerGroup + (extraPlayers > 0 ? 1 : 0);
    extraPlayers -= 1;

    const groupPlayers = participants.slice(currentIndex, currentIndex + playersInGroup);
    currentIndex += playersInGroup;

    return {
      id: `group-${index + 1}`,
      letter: LETTERS[index] ?? `G${index + 1}`,
      players: groupPlayers,
    };
  });

  return {
    ok: true,
    groupData,
    useRepechage,
  };
}
