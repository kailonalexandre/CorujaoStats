"use server";

import { revalidatePath } from "next/cache";
import {
  createUser,
  setUserActive,
  updateUserAccess,
  updateUserPermissions,
} from "@/lib/db/users";
import { requirePermission } from "@/lib/auth/session";
import { updateUserAccessSchema, userIdSchema, userSchema } from "@/lib/validations/auth";

const DEFAULT_USER_PERMISSIONS = ["manage_raffles", "manage_matches", "view_stats"] as const;

export type UserFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    playerId?: string[];
    permissions?: string[];
  };
};

function parsePermissions(formData: FormData) {
  return formData.getAll("permissions").map(String);
}

export async function createUserAction(
  _previousState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requirePermission("manage_users");

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    playerId: formData.get("playerId"),
    active: formData.get("active") === "true",
    permissions:
      formData.get("role") === "user" && formData.getAll("permissions").length === 0
        ? [...DEFAULT_USER_PERMISSIONS]
        : parsePermissions(formData),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os dados do usuario.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createUser(parsed.data);
  } catch {
    return {
      status: "error",
      message: "Nao foi possivel cadastrar o usuario. Verifique se o e-mail ja existe.",
    };
  }

  revalidatePath("/settings/users");

  return {
    status: "success",
    message: "Usuario cadastrado com sucesso.",
  };
}

export async function updateUserAccessAction(formData: FormData) {
  await requirePermission("manage_users");

  const parsed = updateUserAccessSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
    playerId: formData.get("playerId"),
  });

  if (!parsed.success) {
    return;
  }

  await updateUserAccess(parsed.data.id, parsed.data.role, parsed.data.playerId);
  revalidatePath("/settings/users");
}

export async function updateUserPermissionsAction(formData: FormData) {
  await requirePermission("manage_users");

  const parsed = userIdSchema.safeParse({ id: formData.get("id") });
  const parsedPermissions = userSchema.shape.permissions.safeParse(parsePermissions(formData));

  if (!parsed.success || !parsedPermissions.success) {
    return;
  }

  await updateUserPermissions(parsed.data.id, parsedPermissions.data);
  revalidatePath("/settings/users");
}

export async function toggleUserActiveAction(formData: FormData) {
  await requirePermission("manage_users");

  const parsed = userIdSchema.safeParse({ id: formData.get("id") });

  if (!parsed.success) {
    return;
  }

  await setUserActive(parsed.data.id, formData.get("active") === "true");
  revalidatePath("/settings/users");
}
