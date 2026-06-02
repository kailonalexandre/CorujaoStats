import type { Player } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_GROUP_ID } from "@/lib/db/players";

type NumericField =
  | "goals"
  | "kills"
  | "deaths"
  | "assists"
  | "score"
  | "knifeKills"
  | "headshots";

type PlayerSummary = Pick<Player, "id" | "name" | "nickname" | "photoUrl">;

export type PlayerMetricRow = {
  player: PlayerSummary;
  value: number;
  secondary?: string;
};

export type MostUsedItemRow = {
  player: PlayerSummary;
  itemName: string;
  count: number;
};

export type PopularItemRow = {
  itemName: string;
  count: number;
};

async function getPlayersMap(playerIds: string[]) {
  const players = await prisma.player.findMany({
    where: {
      groupId: DEFAULT_GROUP_ID,
      id: {
        in: playerIds,
      },
    },
    select: {
      id: true,
      name: true,
      nickname: true,
      photoUrl: true,
    },
  });

  return new Map(players.map((player) => [player.id, player]));
}

function gameWhere(slugs: string[]) {
  return {
    match: {
      groupId: DEFAULT_GROUP_ID,
      game: {
        slug: {
          in: slugs,
        },
      },
    },
  };
}

export async function getSumRanking(slugs: string[], field: NumericField, take = 10) {
  const rows = await prisma.matchPlayer.groupBy({
    by: ["playerId"],
    where: gameWhere(slugs),
    _sum: {
      [field]: true,
    },
  });
  const players = await getPlayersMap(rows.map((row) => row.playerId));

  return rows
    .flatMap((row) => {
      const player = players.get(row.playerId);
      const value = row._sum[field] ?? 0;

      return player ? [{ player, value }] : [];
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, take);
}

export async function getWinRanking(slugs: string[], take = 10) {
  const rows = await prisma.matchPlayer.groupBy({
    by: ["playerId"],
    where: {
      ...gameWhere(slugs),
      result: "win",
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        playerId: "desc",
      },
    },
    take,
  });
  const players = await getPlayersMap(rows.map((row) => row.playerId));

  return rows
    .map((row) => {
      const player = players.get(row.playerId);
      return player ? { player, value: row._count._all } : null;
    })
    .filter((row): row is PlayerMetricRow => Boolean(row));
}

export async function getAverageRanking(slugs: string[], field: NumericField, take = 10) {
  const rows = await prisma.matchPlayer.groupBy({
    by: ["playerId"],
    where: gameWhere(slugs),
    _avg: {
      [field]: true,
    },
  });
  const players = await getPlayersMap(rows.map((row) => row.playerId));

  return rows
    .flatMap((row) => {
      const player = players.get(row.playerId);
      const value = Number(row._avg[field] ?? 0);

      return player ? [{ player, value: Number(value.toFixed(1)) }] : [];
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, take);
}

export async function getKdRanking(slugs: string[], take = 10) {
  const rows = await prisma.matchPlayer.groupBy({
    by: ["playerId"],
    where: gameWhere(slugs),
    _sum: {
      kills: true,
      deaths: true,
    },
  });
  const players = await getPlayersMap(rows.map((row) => row.playerId));

  return rows
    .flatMap((row) => {
      const player = players.get(row.playerId);
      const kills = row._sum.kills ?? 0;
      const deaths = row._sum.deaths ?? 0;
      const value = deaths === 0 ? kills : Number((kills / deaths).toFixed(2));

      return player ? [{ player, value, secondary: `${kills}/${deaths}` }] : [];
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, take);
}

export async function getFightTotals(slugs: string[], take = 10) {
  const rows = await prisma.matchPlayer.groupBy({
    by: ["playerId"],
    where: gameWhere(slugs),
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        playerId: "desc",
      },
    },
    take,
  });
  const players = await getPlayersMap(rows.map((row) => row.playerId));

  return rows
    .map((row) => {
      const player = players.get(row.playerId);
      return player ? { player, value: row._count._all } : null;
    })
    .filter((row): row is PlayerMetricRow => Boolean(row));
}

export async function getWinRateRanking(slugs: string[], take = 10) {
  const rows = await prisma.matchPlayer.groupBy({
    by: ["playerId", "result"],
    where: gameWhere(slugs),
    _count: {
      _all: true,
    },
  });
  const totals = new Map<string, { total: number; wins: number }>();

  for (const row of rows) {
    const current = totals.get(row.playerId) ?? { total: 0, wins: 0 };
    current.total += row._count._all;
    if (row.result === "win") {
      current.wins += row._count._all;
    }
    totals.set(row.playerId, current);
  }

  const players = await getPlayersMap([...totals.keys()]);

  return [...totals.entries()]
    .flatMap(([playerId, total]) => {
      const player = players.get(playerId);
      const value = total.total === 0 ? 0 : Math.round((total.wins / total.total) * 100);

      return player ? [{ player, value, secondary: `${total.wins}/${total.total}` }] : [];
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, take);
}

export async function getMostUsedItemByPlayer(slugs: string[], itemType?: string) {
  const rows = await prisma.matchPlayer.groupBy({
    by: ["playerId", "selectedItemId"],
    where: {
      ...gameWhere(slugs),
      selectedItemId: {
        not: null,
      },
      selectedItem: itemType
        ? {
            type: itemType as never,
          }
        : undefined,
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        selectedItemId: "desc",
      },
    },
  });
  const bestByPlayer = new Map<string, { itemId: string; count: number }>();

  for (const row of rows) {
    if (!row.selectedItemId) continue;
    const current = bestByPlayer.get(row.playerId);
    if (!current || row._count._all > current.count) {
      bestByPlayer.set(row.playerId, { itemId: row.selectedItemId, count: row._count._all });
    }
  }

  const [players, items] = await Promise.all([
    getPlayersMap([...bestByPlayer.keys()]),
    prisma.gameItem.findMany({
      where: {
        id: {
          in: [...bestByPlayer.values()].map((value) => value.itemId),
        },
      },
    }),
  ]);
  const itemMap = new Map(items.map((item) => [item.id, item]));

  return [...bestByPlayer.entries()]
    .map(([playerId, value]) => {
      const player = players.get(playerId);
      const item = itemMap.get(value.itemId);

      return player && item ? { player, itemName: item.name, count: value.count } : null;
    })
    .filter((row): row is MostUsedItemRow => Boolean(row))
    .sort((a, b) => b.count - a.count);
}

export async function getPopularSelectedItems(slugs: string[], itemType?: string, take = 10) {
  const rows = await prisma.matchPlayer.groupBy({
    by: ["selectedItemId"],
    where: {
      ...gameWhere(slugs),
      selectedItemId: {
        not: null,
      },
      selectedItem: itemType
        ? {
            type: itemType as never,
          }
        : undefined,
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        selectedItemId: "desc",
      },
    },
    take,
  });
  const items = await prisma.gameItem.findMany({
    where: {
      id: {
        in: rows.flatMap((row) => (row.selectedItemId ? [row.selectedItemId] : [])),
      },
    },
  });
  const itemMap = new Map(items.map((item) => [item.id, item]));

  return rows
    .map((row) => {
      const item = row.selectedItemId ? itemMap.get(row.selectedItemId) : null;
      return item ? { itemName: item.name, count: row._count._all } : null;
    })
    .filter((row): row is PopularItemRow => Boolean(row));
}

export async function getPopularBattlefieldMaps(take = 10) {
  const rows = await prisma.matchPlayer.groupBy({
    by: ["teamName"],
    where: {
      ...gameWhere(["battlefield"]),
      teamName: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        teamName: "desc",
      },
    },
    take,
  });

  return rows
    .map((row) => (row.teamName ? { itemName: row.teamName, count: row._count._all } : null))
    .filter((row): row is PopularItemRow => Boolean(row));
}
