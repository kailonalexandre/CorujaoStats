import { prisma } from "@/lib/db/prisma";
import type { PlayerInput } from "@/lib/validations/player";

export const DEFAULT_GROUP_ID = "default-group";
export const DEFAULT_GROUP_NAME = "Grupo Principal";

export async function ensureDefaultGroup() {
  return prisma.group.upsert({
    where: { id: DEFAULT_GROUP_ID },
    update: {
      name: DEFAULT_GROUP_NAME,
    },
    create: {
      id: DEFAULT_GROUP_ID,
      name: DEFAULT_GROUP_NAME,
    },
  });
}

export async function getPlayersByDefaultGroup() {
  await ensureDefaultGroup();

  return prisma.player.findMany({
    where: {
      groupId: DEFAULT_GROUP_ID,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPlayerById(id: string) {
  return prisma.player.findFirst({
    where: {
      id,
      groupId: DEFAULT_GROUP_ID,
    },
  });
}

export async function createPlayer(data: PlayerInput) {
  await ensureDefaultGroup();

  return prisma.player.create({
    data: {
      name: data.name,
      nickname: data.nickname || null,
      age: data.age ?? null,
      photoUrl: data.photoUrl || null,
      coverUrl: data.coverUrl || null,
      groupId: DEFAULT_GROUP_ID,
    },
  });
}

export async function updatePlayer(id: string, data: PlayerInput) {
  return prisma.player.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      nickname: data.nickname || null,
      age: data.age ?? null,
      photoUrl: data.photoUrl || null,
      coverUrl: data.coverUrl || null,
      groupId: DEFAULT_GROUP_ID,
    },
  });
}

export async function deletePlayer(id: string) {
  return prisma.player.delete({
    where: {
      id,
    },
  });
}
