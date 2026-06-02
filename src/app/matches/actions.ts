"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createMatchWithPlayers } from "@/lib/db/matches";
import { matchSchema, type MatchInput } from "@/lib/validations/match";

export type MatchFormState = {
  status: "success" | "error";
  message: string;
};

function validateGameRules(input: MatchInput) {
  if (input.gameSlug === "pes") {
    for (const player of input.players) {
      if (!player.selectedItemId) return "Informe o time usado para todos os jogadores.";
      if (!player.result) return "Informe o resultado para todos os jogadores.";
    }
  }

  if (input.gameSlug === "mortal-kombat") {
    for (const player of input.players) {
      if (!player.selectedItemId) return "Informe o personagem usado para todos os jogadores.";
      if (!player.result || player.result === "draw") return "Mortal Kombat permite apenas win ou loss.";
    }
  }

  if (input.gameSlug === "cs-go" || input.gameSlug === "cs-go-cs2") {
    for (const player of input.players) {
      if (!player.mapItemId) return "Informe o mapa usado no CS:GO.";
      if (!player.teamName) return "Informe o time de todos os jogadores.";
      if (!player.result) return "Informe o resultado de todos os jogadores.";
    }
  }

  if (input.gameSlug === "battlefield") {
    for (const player of input.players) {
      if (!player.mapItemId) return "Informe o mapa usado no Battlefield.";
      if (!player.classItemId) return "Informe a classe usada por todos os jogadores.";
      if (!player.result) return "Informe o resultado de todos os jogadores.";
    }
  }

  return null;
}

export async function createMatchAction(payload: unknown): Promise<MatchFormState> {
  const parsed = matchSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Revise os dados da partida.",
    };
  }

  const ruleError = validateGameRules(parsed.data);

  if (ruleError) {
    return {
      status: "error",
      message: ruleError,
    };
  }

  try {
    await createMatchWithPlayers(parsed.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "error", message: "Dados invalidos." };
    }

    return { status: "error", message: "Nao foi possivel registrar a partida." };
  }

  revalidatePath("/matches");
  revalidatePath("/stats");
  revalidatePath("/ranking");
  revalidatePath("/");

  return {
    status: "success",
    message: "Partida registrada com sucesso.",
  };
}
