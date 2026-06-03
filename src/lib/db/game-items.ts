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
  groupName?: string;
}) {
  return prisma.gameItem.findMany({
    where: {
      gameId: filters.gameId || undefined,
      type: filters.type,
      groupName: filters.groupName || undefined,
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
      groupName: data.groupName || null,
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
      groupName: data.groupName || null,
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
