import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserPermissionType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { AUTH_COOKIE_NAME, hasPermission } from "@/lib/auth/permissions";
import { verifyAuthToken } from "@/lib/auth/jwt";

export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const payload = await verifyAuthToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { permissions: true },
  });

  if (!user?.active) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    playerId: user.playerId,
    permissions: user.permissions.map((item) => item.permission),
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requirePermission(permission: UserPermissionType) {
  const user = await requireAuth();

  if (!hasPermission(user, permission)) {
    redirect("/");
  }

  return user;
}
