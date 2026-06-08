import { describe, expect, it } from "vitest";

import { generatePesMainBracket, generatePesRepechageBracket } from "../pes.bracket";
import { drawPesGroups } from "../pes.draw";
import { generatePesGroupMatches } from "../pes.matches";
import { updatePesGroupMatchScore, updatePesKnockoutMatchScore } from "../pes.score";
import { calculatePesStandings, getPesQualifiedPlayers } from "../pes.standings";
import type {
  PesGroup,
  PesMatch,
  PesParticipant,
  PesPlayerInput,
  PesQualifiedPlayer,
  PesTeamInput,
  PesTournamentState,
} from "../pes.types";

const random = () => 0;

function players(count: number): PesPlayerInput[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Player ${index + 1}`,
    nickname: `P${index + 1}`,
    photoUrl: `/players/${index + 1}.jpg`,
  }));
}

function teams(count: number): PesTeamInput[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `Team ${index + 1}`,
  }));
}

function participant(index: number): PesParticipant {
  const team = {
    id: `team-${index}`,
    name: `Team ${index}`,
  };

  return {
    id: `player-${index}`,
    name: `Player ${index}`,
    nickname: `P${index}`,
    photoUrl: `/players/${index}.jpg`,
    teamId: team.id,
    teamName: team.name,
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

function group(letter: string, indexes: number[]): PesGroup {
  return {
    id: `group-${letter}`,
    letter,
    players: indexes.map((index) => participant(index)),
  };
}

function state(groups: PesGroup[], matches: PesMatch[], useRepechage = false): PesTournamentState {
  return {
    groups,
    matches,
    matchIdCounter: 100,
    useRepechage,
    champion: null,
    repechageChampion: null,
  };
}

function qualified(indexes: number[], groupLetters?: string[], positions?: number[]): PesQualifiedPlayer[] {
  return indexes.map((index, listIndex) => ({
    playerId: `player-${index}`,
    playerName: `Player ${index}`,
    photoUrl: `/players/${index}.jpg`,
    teamName: `Team ${index}`,
    groupLetter: groupLetters?.[listIndex] ?? String.fromCharCode(65 + listIndex),
    position: positions?.[listIndex] ?? 1,
  }));
}

function baseGroupState() {
  const groups = [group("A", [1, 2]), group("B", [3, 4])];
  return state(groups, generatePesGroupMatches(groups));
}

function finishMatch(
  gameState: PesTournamentState,
  matchId: string,
  goals1: number,
  goals2: number,
  pen1?: number,
  pen2?: number,
) {
  return updatePesKnockoutMatchScore({
    gameState,
    matchId,
    goals1,
    goals2,
    pen1,
    pen2,
  });
}

describe("PES logic", () => {
  it("1. sorteia jogadores em 2 grupos", () => {
    const result = drawPesGroups({
      players: players(4),
      numberOfGroups: 2,
      availableTeams: teams(4),
      random,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.groupData).toHaveLength(2);
    expect(result.groupData.map((item) => item.letter)).toEqual(["A", "B"]);
  });

  it("2. distribui jogadores de forma equilibrada", () => {
    const result = drawPesGroups({
      players: players(5),
      numberOfGroups: 2,
      availableTeams: teams(5),
      random,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.groupData.map((item) => item.players.length).sort()).toEqual([2, 3]);
  });

  it("3. sorteia times sem repeticao", () => {
    const result = drawPesGroups({
      players: players(6),
      numberOfGroups: 2,
      availableTeams: teams(6),
      random,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const teamIds = result.groupData.flatMap((item) => item.players.map((player) => player.team?.id));
    expect(new Set(teamIds).size).toBe(teamIds.length);
  });

  it("4. retorna erro quando ha mais jogadores que times disponiveis", () => {
    const result = drawPesGroups({
      players: players(4),
      numberOfGroups: 2,
      availableTeams: teams(3),
      random,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("Nao ha times do PES suficientes");
  });

  it("5. gera confrontos todos contra todos", () => {
    const [groupA] = [group("A", [1, 2, 3])];
    const matches = generatePesGroupMatches([groupA]);

    expect(matches.map((match) => `${match.player1Name} x ${match.player2Name}`)).toEqual([
      "Player 1 x Player 2",
      "Player 1 x Player 3",
      "Player 2 x Player 3",
    ]);
  });

  it("6. atualiza placar com vitoria", () => {
    const gameState = baseGroupState();
    const updated = updatePesGroupMatchScore({
      gameState,
      matchId: gameState.matches[0].id,
      goals1: 2,
      goals2: 0,
    });
    const match = updated.matches.find((item) => item.id === gameState.matches[0].id);

    expect(match?.isFinished).toBe(true);
    expect(match?.winnerPlayerId).toBe(gameState.matches[0].player1.id);
    expect(match?.draw).toBe(false);
  });

  it("7. atualiza placar com empate", () => {
    const gameState = baseGroupState();
    const updated = updatePesGroupMatchScore({
      gameState,
      matchId: gameState.matches[0].id,
      goals1: 1,
      goals2: 1,
    });
    const match = updated.matches.find((item) => item.id === gameState.matches[0].id);

    expect(match?.isFinished).toBe(true);
    expect(match?.winnerPlayerId).toBeNull();
    expect(match?.draw).toBe(true);
  });

  it("8. calcula pontos", () => {
    const groups = [group("A", [1, 2, 3])];
    let gameState = state(groups, generatePesGroupMatches(groups));

    gameState = updatePesGroupMatchScore({
      gameState,
      matchId: gameState.matches[0].id,
      goals1: 2,
      goals2: 0,
    });
    gameState = updatePesGroupMatchScore({
      gameState,
      matchId: gameState.matches[1].id,
      goals1: 1,
      goals2: 1,
    });

    const standings = calculatePesStandings(gameState.groups, gameState.matches)[0].players;

    expect(standings.find((player) => player.playerId === "player-1")?.points).toBe(4);
    expect(standings.find((player) => player.playerId === "player-2")?.points).toBe(0);
    expect(standings.find((player) => player.playerId === "player-3")?.points).toBe(1);
  });

  it("9. calcula saldo de gols", () => {
    const groups = [group("A", [1, 2])];
    let gameState = state(groups, generatePesGroupMatches(groups));

    gameState = updatePesGroupMatchScore({
      gameState,
      matchId: gameState.matches[0].id,
      goals1: 4,
      goals2: 1,
    });

    const standings = calculatePesStandings(gameState.groups, gameState.matches)[0].players;

    expect(standings.find((player) => player.playerId === "player-1")?.goalDifference).toBe(3);
    expect(standings.find((player) => player.playerId === "player-2")?.goalDifference).toBe(-3);
  });

  it("10. ordena a classificacao pelos criterios definidos", () => {
    const groups = [group("A", [1, 2, 3])];
    let gameState = state(groups, generatePesGroupMatches(groups));

    gameState = updatePesGroupMatchScore({
      gameState,
      matchId: gameState.matches[0].id,
      goals1: 1,
      goals2: 0,
    });
    gameState = updatePesGroupMatchScore({
      gameState,
      matchId: gameState.matches[1].id,
      goals1: 0,
      goals2: 2,
    });
    gameState = updatePesGroupMatchScore({
      gameState,
      matchId: gameState.matches[2].id,
      goals1: 1,
      goals2: 1,
    });

    const standings = calculatePesStandings(gameState.groups, gameState.matches)[0].players;

    expect(standings.map((player) => player.playerId)).toEqual(["player-3", "player-1", "player-2"]);
    expect(standings.map((player) => player.position)).toEqual([1, 2, 3]);
  });

  it("11. separa classificados", () => {
    const standings = calculatePesStandings([group("A", [1, 2, 3]), group("B", [4, 5, 6])], [], {
      useRepechage: false,
    });
    const result = getPesQualifiedPlayers(standings, false);

    expect(result.qualifiedPlayers).toHaveLength(4);
    expect(result.qualifiedPlayers.every((player) => player.position <= 2)).toBe(true);
  });

  it("12. separa jogadores da repescagem", () => {
    const standings = calculatePesStandings([group("A", [1, 2, 3]), group("B", [4, 5, 6])], [], {
      useRepechage: true,
    });
    const result = getPesQualifiedPlayers(standings, true);

    expect(result.repechagePlayers).toHaveLength(2);
    expect(result.repechagePlayers.every((player) => player.position === 3)).toBe(true);
  });

  it("13. gera mata-mata principal", () => {
    const matches = generatePesMainBracket(qualified([1, 2, 3, 4], ["A", "B", "A", "B"]));

    expect(matches).toHaveLength(2);
    expect(matches.every((match) => match.stage === "final")).toBe(true);
    expect(matches.every((match) => match.round === 1)).toBe(true);
  });

  it("13b. cruza semifinais entre primeiro e segundo de grupos opostos", () => {
    const matches = generatePesMainBracket(
      qualified([1, 2, 3, 4], ["A", "A", "B", "B"], [1, 2, 1, 2]),
    );

    expect(matches.map((match) => [match.player1Id, match.player2Id])).toEqual([
      ["player-1", "player-4"],
      ["player-3", "player-2"],
    ]);
  });

  it("14. gera BYE quando a quantidade de jogadores e impar", () => {
    const matches = generatePesMainBracket(qualified([1, 2, 3]));
    const byeMatch = matches.find((match) => match.isBye);

    expect(byeMatch?.player2Id).toBeNull();
    expect(byeMatch?.player2Name).toBe("BYE");
    expect(byeMatch?.isFinished).toBe(true);
    expect(byeMatch?.winnerPlayerId).toBe(byeMatch?.player1Id);
  });

  it("15. atualiza mata-mata com vencedor", () => {
    const groups = [group("A", [1, 2])];
    const matches = generatePesMainBracket(qualified([1, 2]));
    const gameState = state(groups, matches);
    const updated = finishMatch(gameState, matches[0].id, 3, 1);

    expect(updated.matches[0].isFinished).toBe(true);
    expect(updated.matches[0].winnerPlayerId).toBe("player-1");
  });

  it("16. deixa mata-mata empatado aguardando penaltis", () => {
    const groups = [group("A", [1, 2])];
    const matches = generatePesMainBracket(qualified([1, 2]));
    const gameState = state(groups, matches);
    const updated = finishMatch(gameState, matches[0].id, 2, 2);

    expect(updated.matches[0].draw).toBe(true);
    expect(updated.matches[0].isFinished).toBe(false);
    expect(updated.matches[0].status).toBe("draw_needs_penalties");
  });

  it("17. nao permite penaltis empatados", () => {
    const groups = [group("A", [1, 2])];
    const matches = generatePesMainBracket(qualified([1, 2]));
    const gameState = state(groups, matches);

    expect(() => finishMatch(gameState, matches[0].id, 1, 1, 4, 4)).toThrow(
      "Penaltis nao podem terminar empatados.",
    );
  });

  it("18. gera automaticamente a proxima rodada", () => {
    const groups = [group("A", [1, 2, 3, 4])];
    const matches = generatePesMainBracket(qualified([1, 2, 3, 4]));
    let gameState = state(groups, matches);

    gameState = finishMatch(gameState, matches[0].id, 2, 0);
    gameState = finishMatch(gameState, matches[1].id, 1, 0);

    const nextRoundMatches = gameState.matches.filter((match) => match.stage === "final" && match.round === 2);
    expect(nextRoundMatches).toHaveLength(1);
    expect(nextRoundMatches[0].player1Id).toBe("player-1");
    expect(nextRoundMatches[0].player2Id).toBe("player-3");
  });

  it("19. define campeao principal", () => {
    const groups = [group("A", [1, 2, 3, 4])];
    const matches = generatePesMainBracket(qualified([1, 2, 3, 4]));
    let gameState = state(groups, matches);

    gameState = finishMatch(gameState, matches[0].id, 2, 0);
    gameState = finishMatch(gameState, matches[1].id, 1, 0);
    const finalMatch = gameState.matches.find((match) => match.stage === "final" && match.round === 2);
    if (!finalMatch) throw new Error("Final nao gerada.");
    gameState = finishMatch(gameState, finalMatch.id, 3, 2);

    expect(gameState.champion?.playerId).toBe("player-1");
    expect(gameState.champion?.stage).toBe("final");
  });

  it("20. define campeao da repescagem", () => {
    const groups = [group("A", [1, 2, 3, 4])];
    const matches = generatePesRepechageBracket(qualified([1, 2, 3, 4]));
    let gameState = state(groups, matches, true);

    gameState = finishMatch(gameState, matches[0].id, 2, 0);
    gameState = finishMatch(gameState, matches[1].id, 0, 1);
    const finalMatch = gameState.matches.find((match) => match.stage === "repechage" && match.round === 2);
    if (!finalMatch) throw new Error("Final da repescagem nao gerada.");
    gameState = finishMatch(gameState, finalMatch.id, 2, 1);

    expect(gameState.repechageChampion?.playerId).toBe("player-1");
    expect(gameState.repechageChampion?.stage).toBe("repechage");
  });

  it("21. gera pos-grupos com metade superior classificada", () => {
    const groups = [group("A", [1, 2, 3, 4, 5])];
    let gameState = state(groups, generatePesGroupMatches(groups));

    for (const match of gameState.matches) {
      gameState = updatePesGroupMatchScore({
        gameState,
        matchId: match.id,
        goals1: 1,
        goals2: 0,
      });
    }

    const finalMatches = gameState.matches.filter((match) => match.stage === "final" && match.round === 1);
    const finalPlayerIds = new Set(finalMatches.flatMap((match) => [match.player1Id, match.player2Id].filter(Boolean)));

    expect(finalPlayerIds.size).toBe(3);
  });

  it("22. gera repescagem independente da chave principal apos grupos", () => {
    const groups = [group("A", [1, 2, 3]), group("B", [4, 5, 6])];
    let gameState = state(groups, generatePesGroupMatches(groups), true);

    for (const match of gameState.matches) {
      gameState = updatePesGroupMatchScore({
        gameState,
        matchId: match.id,
        goals1: 1,
        goals2: 0,
      });
    }

    const finalMatches = gameState.matches.filter((match) => match.stage === "final");
    const repechageMatches = gameState.matches.filter((match) => match.stage === "repechage");

    expect(finalMatches).toHaveLength(2);
    expect(repechageMatches).toHaveLength(1);
    expect(repechageMatches[0].winnerPlayerId).toBeNull();
  });
});
