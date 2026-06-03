import { prisma } from "@/lib/db/prisma";
import { DEFAULT_GROUP_ID, ensureDefaultGroup } from "@/lib/db/players";
import type { MatchInput } from "@/lib/validations/match";

function nullableNumber(value: number | null | undefined) {
  return value ?? null;
}

function buildDescription(input: MatchInput, mapName?: string | null) {
  const parts = [];

  if (input.description) {
    parts.push(input.description);
  }

  if (mapName) {
    parts.push(`Mapa: ${mapName}`);
  }

  return parts.length > 0 ? parts.join(" | ") : null;
}

export async function createMatchWithPlayers(input: MatchInput) {
  await ensureDefaultGroup();

  const mapItemId = input.players.find((player) => player.mapItemId)?.mapItemId;
  const mapItem = mapItemId
    ? await prisma.gameItem.findUnique({
        where: {
          id: mapItemId,
        },
      })
    : null;

  return prisma.match.create({
    data: {
      groupId: DEFAULT_GROUP_ID,
      gameId: input.gameId,
      date: input.date ?? new Date(),
      description: buildDescription(input, mapItem?.name),
      players: {
        create: input.players.map((player) => {
          const selectedItemId =
            input.gameSlug === "battlefield"
              ? player.classItemId
              : input.gameSlug === "cs-go" || input.gameSlug === "cs-go-cs2"
                ? player.mapItemId
                : player.selectedItemId;

          return {
            playerId: player.playerId,
            selectedItemId: selectedItemId || null,
            teamName:
              input.gameSlug === "battlefield"
                ? mapItem?.name ?? null
                : player.teamName || null,
            result: player.result ?? null,
            score: nullableNumber(player.score),
            kills: nullableNumber(player.kills),
            deaths: nullableNumber(player.deaths),
            assists: nullableNumber(player.assists),
            goals: nullableNumber(player.goals),
            goalsAgainst: nullableNumber(player.goalsAgainst),
            knifeKills: nullableNumber(player.knifeKills),
            headshots: nullableNumber(player.headshots),
            damage: nullableNumber(player.damage),
          };
        }),
      },
    },
  });
}

export async function getRecentMatches(gameSlugs?: string[]) {
  return prisma.match.findMany({
    where: {
      groupId: DEFAULT_GROUP_ID,
      game: gameSlugs?.length
        ? {
            slug: {
              in: gameSlugs,
            },
          }
        : undefined,
    },
    take: 10,
    include: {
      game: true,
      players: {
        include: {
          player: true,
          selectedItem: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}
