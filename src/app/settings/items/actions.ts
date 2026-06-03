"use server";

import { revalidatePath } from "next/cache";
import { createGameItem, setGameItemActive, updateGameItem } from "@/lib/db/game-items";
import { requirePermission } from "@/lib/auth/session";
import { gameItemIdSchema, gameItemSchema } from "@/lib/validations/game";

export type GameItemFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    gameId?: string[];
    name?: string[];
    type?: string[];
    groupName?: string[];
    imageUrl?: string[];
  };
};

function parseGameItemForm(formData: FormData) {
  return gameItemSchema.safeParse({
    gameId: formData.get("gameId"),
    name: formData.get("name"),
    type: formData.get("type"),
    groupName: formData.get("groupName"),
    imageUrl: formData.get("imageUrl"),
    active: formData.get("active") !== "false",
  });
}

export async function createGameItemAction(
  _previousState: GameItemFormState,
  formData: FormData,
): Promise<GameItemFormState> {
  await requirePermission("manage_items");

  const parsed = parseGameItemForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos do item.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createGameItem(parsed.data);
  revalidatePath("/settings/items");
  revalidatePath("/raffles");

  return {
    status: "success",
    message: "Item cadastrado com sucesso.",
  };
}

export async function updateGameItemAction(
  _previousState: GameItemFormState,
  formData: FormData,
): Promise<GameItemFormState> {
  await requirePermission("manage_items");

  const parsedId = gameItemIdSchema.safeParse({
    id: formData.get("id"),
  });
  const parsedItem = parseGameItemForm(formData);

  if (!parsedId.success || !parsedItem.success) {
    return {
      status: "error",
      message: "Revise os campos do item.",
      fieldErrors: parsedItem.success ? undefined : parsedItem.error.flatten().fieldErrors,
    };
  }

  await updateGameItem(parsedId.data.id, parsedItem.data);
  revalidatePath("/settings/items");
  revalidatePath("/raffles");

  return {
    status: "success",
    message: "Item atualizado com sucesso.",
  };
}

export async function toggleGameItemActiveAction(formData: FormData) {
  await requirePermission("manage_items");

  const parsed = gameItemIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return;
  }

  await setGameItemActive(parsed.data.id, formData.get("active") === "true");
  revalidatePath("/settings/items");
  revalidatePath("/raffles");
}
