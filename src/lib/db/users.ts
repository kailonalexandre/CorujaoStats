import type { UserPermissionType, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import type { UserInput } from "@/lib/validations/auth";

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: {
      player: true,
      permissions: {
        orderBy: { permission: "asc" },
      },
    },
  });
}

export async function getUserForLogin(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { permissions: true },
  });
}

export async function createUser(input: UserInput) {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      role: input.role,
      playerId: input.playerId,
      active: input.active,
      permissions: {
        create: input.permissions.map((permission) => ({ permission })),
      },
    },
  });
}

export async function updateUserAccess(id: string, role: UserRole, playerId: string | null) {
  return prisma.user.update({
    where: { id },
    data: {
      role,
      playerId,
    },
  });
}

export async function setUserActive(id: string, active: boolean) {
  return prisma.user.update({
    where: { id },
    data: { active },
  });
}

export async function updateUserPermissions(id: string, permissions: UserPermissionType[]) {
  return prisma.$transaction([
    prisma.userPermission.deleteMany({ where: { userId: id } }),
    prisma.userPermission.createMany({
      data: permissions.map((permission) => ({ userId: id, permission })),
      skipDuplicates: true,
    }),
  ]);
}

export async function updateLastLogin(id: string) {
  return prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}
