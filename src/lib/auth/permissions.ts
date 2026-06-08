import type { UserPermissionType, UserRole } from "@prisma/client";

export const AUTH_COOKIE_NAME = "sorteador_session";

export const ALL_PERMISSIONS = [
  "manage_players",
  "manage_games",
  "manage_items",
  "manage_raffles",
  "manage_matches",
  "view_stats",
  "manage_users",
] as const satisfies UserPermissionType[];

export const BASIC_USER_PERMISSIONS = [
  "manage_raffles",
  "manage_matches",
  "view_stats",
] as const satisfies UserPermissionType[];

export const permissionLabels: Record<UserPermissionType, string> = {
  manage_players: "Gerenciar jogadores",
  manage_games: "Gerenciar jogos",
  manage_items: "Gerenciar itens",
  manage_raffles: "Gerenciar sorteios",
  manage_matches: "Gerenciar partidas",
  view_stats: "Ver estatisticas e rankings",
  manage_users: "Gerenciar usuarios",
};

export function hasPermission(
  user: { role: UserRole; permissions: UserPermissionType[] } | null,
  permission: UserPermissionType,
) {
  if (!user) return false;
  if (user.role === "admin") return true;

  return user.permissions.includes(permission);
}
