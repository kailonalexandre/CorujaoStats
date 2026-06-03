"use server";

import { revalidatePath } from "next/cache";
import { createGame } from "@/lib/db/games";
import { requirePermission } from "@/lib/auth/session";
import { gameSchema } from "@/lib/validations/game";

export type GameFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    name?: string[];
    slug?: string[];
    description?: string[];
  };
};

export async function createGameAction(
  _previousState: GameFormState,
  formData: FormData,
): Promise<GameFormState> {
  await requirePermission("manage_games");

  const parsed = gameSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos do jogo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createGame(parsed.data);
  } catch {
    return {
      status: "error",
      message: "Nao foi possivel cadastrar o jogo. Verifique se o slug ja existe.",
    };
  }

  revalidatePath("/settings/games");
  revalidatePath("/settings/items");
  revalidatePath("/raffles");

  return {
    status: "success",
    message: "Jogo cadastrado com sucesso.",
  };
}
