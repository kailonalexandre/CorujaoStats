import type { GameItemType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { GameItemInput } from "@/lib/validations/game";

export async function getGamesForItems() {
  return prisma.game.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getGameItems(filters: {
  gameId?: string;
  type?: GameItemType;
}) {
  return prisma.gameItem.findMany({
    where: {
      gameId: filters.gameId || undefined,
      type: filters.type,
    },
    include: {
      game: true,
    },
    orderBy: [
      {
        active: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function createGameItem(data: GameItemInput) {
  return prisma.gameItem.create({
    data: {
      gameId: data.gameId,
      name: data.name,
      type: data.type,
      imageUrl: data.imageUrl || null,
      active: data.active,
    },
  });
}

export async function updateGameItem(id: string, data: GameItemInput) {
  return prisma.gameItem.update({
    where: {
      id,
    },
    data: {
      gameId: data.gameId,
      name: data.name,
      type: data.type,
      imageUrl: data.imageUrl || null,
      active: data.active,
    },
  });
}

export async function setGameItemActive(id: string, active: boolean) {
  return prisma.gameItem.update({
    where: {
      id,
    },
    data: {
      active,
    },
  });
}
