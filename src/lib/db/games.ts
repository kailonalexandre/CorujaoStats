import { prisma } from "@/lib/db/prisma";
import type { GameInput } from "@/lib/validations/game";

export async function getGames() {
  return prisma.game.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getGameById(id: string) {
  return prisma.game.findUnique({
    where: {
      id,
    },
  });
}

export async function createGame(data: GameInput) {
  return prisma.game.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    },
  });
}
