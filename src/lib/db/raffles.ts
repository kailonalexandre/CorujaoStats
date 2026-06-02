import { prisma } from "@/lib/db/prisma";
import { DEFAULT_GROUP_ID, ensureDefaultGroup } from "@/lib/db/players";
import type { SaveRaffleHistoryInput } from "@/lib/validations/raffle";

export async function saveRaffleHistory(data: SaveRaffleHistoryInput) {
  await ensureDefaultGroup();

  const drawId = crypto.randomUUID();

  return prisma.raffleHistory.createMany({
    data: data.entries.map((entry) => ({
      drawId,
      groupId: entry.groupId ?? DEFAULT_GROUP_ID,
      gameId: entry.gameId,
      playerId: entry.playerId || null,
      itemId: entry.itemId || null,
      groupName: entry.groupName || null,
    })),
  });
}

export async function getRaffleHistoryFilters() {
  const [games, players] = await Promise.all([
    prisma.game.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.player.findMany({
      where: {
        groupId: DEFAULT_GROUP_ID,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return { games, players };
}

export async function getRaffleHistory(filters: {
  gameId?: string;
  playerId?: string;
  date?: string;
  itemType?: string;
}) {
  const dateStart = filters.date ? new Date(`${filters.date}T00:00:00`) : undefined;
  const dateEnd = filters.date ? new Date(`${filters.date}T23:59:59.999`) : undefined;

  return prisma.raffleHistory.findMany({
    where: {
      groupId: DEFAULT_GROUP_ID,
      gameId: filters.gameId || undefined,
      playerId: filters.playerId || undefined,
      createdAt:
        dateStart && dateEnd
          ? {
              gte: dateStart,
              lte: dateEnd,
            }
          : undefined,
      item: filters.itemType
        ? {
            type: filters.itemType as never,
          }
        : undefined,
    },
    include: {
      game: true,
      player: true,
      item: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 200,
  });
}
