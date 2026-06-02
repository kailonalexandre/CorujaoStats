"use server";

import { revalidatePath } from "next/cache";
import {
  createPlayer,
  deletePlayer,
  getPlayerById,
  updatePlayer,
} from "@/lib/db/players";
import { playerIdSchema, playerSchema } from "@/lib/validations/player";

export type PlayerFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    name?: string[];
    nickname?: string[];
    photoUrl?: string[];
  };
};

export const initialPlayerFormState: PlayerFormState = {
  status: "idle",
  message: "",
};

function parsePlayerForm(formData: FormData) {
  return playerSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname"),
    photoUrl: formData.get("photoUrl"),
  });
}

export async function createPlayerAction(
  _previousState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const parsed = parsePlayerForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos do jogador.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createPlayer(parsed.data);
  revalidatePath("/players");
  revalidatePath("/");
  revalidatePath("/raffles");
  revalidatePath("/ranking");

  return {
    status: "success",
    message: "Jogador cadastrado com sucesso.",
  };
}

export async function updatePlayerAction(
  _previousState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const parsedId = playerIdSchema.safeParse({
    id: formData.get("id"),
  });
  const parsedPlayer = parsePlayerForm(formData);

  if (!parsedId.success || !parsedPlayer.success) {
    return {
      status: "error",
      message: "Revise os campos do jogador.",
      fieldErrors: parsedPlayer.success ? undefined : parsedPlayer.error.flatten().fieldErrors,
    };
  }

  const player = await getPlayerById(parsedId.data.id);

  if (!player) {
    return {
      status: "error",
      message: "Jogador nao encontrado no grupo padrao.",
    };
  }

  await updatePlayer(parsedId.data.id, parsedPlayer.data);
  revalidatePath("/players");
  revalidatePath(`/players/${parsedId.data.id}`);
  revalidatePath("/");
  revalidatePath("/raffles");
  revalidatePath("/ranking");

  return {
    status: "success",
    message: "Jogador atualizado com sucesso.",
  };
}

export async function deletePlayerAction(formData: FormData) {
  const parsed = playerIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return;
  }

  const player = await getPlayerById(parsed.data.id);

  if (!player) {
    return;
  }

  await deletePlayer(parsed.data.id);
  revalidatePath("/players");
  revalidatePath("/");
  revalidatePath("/raffles");
  revalidatePath("/ranking");
}
