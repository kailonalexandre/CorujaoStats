import type { PesGroup, PesMatch, PesMatchPlayer, PesMatchStage, PesParticipant } from "./pes.types";

export function toPesMatchPlayer(player: PesParticipant): PesMatchPlayer {
  return {
    id: player.id,
    name: player.name,
    team: player.team,
  };
}

export function createPesMatch(
  stage: PesMatchStage,
  round: number,
  matchIndex: number,
  player1: PesMatchPlayer,
  player2: PesMatchPlayer | null,
  matchIdCounter: number,
  group?: Pick<PesGroup, "id" | "letter"> & { index?: number },
): PesMatch {
  const isBye = player2 === null;

  return {
    id: `pes-match-${matchIdCounter}`,
    stage,
    round,
    groupId: group?.id ?? null,
    groupLetter: group?.letter ?? null,
    groupIndex: group?.index ?? null,
    matchIndex,
    player1Id: player1.id,
    player2Id: player2?.id ?? null,
    player1Name: player1.name,
    player2Name: player2?.name ?? "BYE",
    player1,
    player2,
    goals1: null,
    goals2: null,
    pen1: null,
    pen2: null,
    penalties1: null,
    penalties2: null,
    winnerPlayerId: isBye ? player1.id : null,
    winnerId: isBye ? player1.id : null,
    loserId: null,
    draw: false,
    isFinished: isBye,
    status: isBye ? "finished" : "pending",
    isBye,
  };
}

export function generatePesGroupMatches(groupData: PesGroup[]): PesMatch[] {
  const matches: PesMatch[] = [];
  let nextId = 1;

  groupData.forEach((group, groupIndex) => {
    let groupMatchIndex = 1;

    for (let firstIndex = 0; firstIndex < group.players.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < group.players.length; secondIndex += 1) {
        matches.push(
          createPesMatch(
            "group",
            1,
            groupMatchIndex,
            toPesMatchPlayer(group.players[firstIndex]),
            toPesMatchPlayer(group.players[secondIndex]),
            nextId,
            {
              ...group,
              index: groupIndex,
            },
          ),
        );
        nextId += 1;
        groupMatchIndex += 1;
      }
    }
  });

  return matches;
}
