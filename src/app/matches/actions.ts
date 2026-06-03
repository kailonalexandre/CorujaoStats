"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createMatchWithPlayers } from "@/lib/db/matches";
import { requirePermission } from "@/lib/auth/session";
import { matchSchema, type MatchInput } from "@/lib/validations/match";
import { emitPesGameStateUpdated } from "@/lib/realtime/pes-realtime";
import { updatePesPersistedMatchScore } from "@/modules/pes";

export type MatchFormState = {
  status: "success" | "error";
  message: string;
};

export type PesScoreFormState = MatchFormState;

const pesScoreFormSchema = z.object({
  sessionId: z.string().trim().min(1, "Jogo PES invalido."),
  matchId: z.string().trim().min(1, "Partida invalida."),
  goals1: z.coerce.number().int("Placar invalido.").min(0, "Placar nao pode ser negativo."),
  goals2: z.coerce.number().int("Placar invalido.").min(0, "Placar nao pode ser negativo."),
  pen1: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int("Penaltis invalidos.").min(0).optional(),
  ),
  pen2: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int("Penaltis invalidos.").min(0).optional(),
  ),
});

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
  await requirePermission("manage_matches");

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

export async function updatePesMatchScoreAction(
  _previousState: PesScoreFormState,
  formData: FormData,
): Promise<PesScoreFormState> {
  await requirePermission("manage_matches");

  const parsed = pesScoreFormSchema.safeParse({
    sessionId: formData.get("sessionId"),
    matchId: formData.get("matchId"),
    goals1: formData.get("goals1"),
    goals2: formData.get("goals2"),
    pen1: formData.get("pen1"),
    pen2: formData.get("pen2"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Revise o placar.",
    };
  }

  try {
    const game = await updatePesPersistedMatchScore(parsed.data);
    emitPesGameStateUpdated(game);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Nao foi possivel atualizar o placar.",
    };
  }

  revalidatePath("/matches");
  revalidatePath("/stats");
  revalidatePath("/ranking");
  revalidatePath("/");

  return {
    status: "success",
    message: "Placar atualizado.",
  };
}
