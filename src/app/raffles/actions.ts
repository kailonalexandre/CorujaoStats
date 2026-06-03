"use server";

import { revalidatePath } from "next/cache";
import { saveRaffleHistory } from "@/lib/db/raffles";
import { saveRaffleHistorySchema, type SaveRaffleHistoryInput } from "@/lib/validations/raffle";
import { createPesGame, type PesUiGameState } from "@/modules/pes";

export type SaveRaffleHistoryState = {
  status: "success" | "error";
  message: string;
};

export type CreatePesRaffleState = SaveRaffleHistoryState & {
  game?: PesUiGameState;
};

export async function saveRaffleHistoryAction(
  payload: SaveRaffleHistoryInput,
): Promise<SaveRaffleHistoryState> {
  const parsed = saveRaffleHistorySchema.safeParse(payload);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel salvar o historico.",
    };
  }

  await saveRaffleHistory(parsed.data);
  revalidatePath("/raffles");
  revalidatePath("/raffles/history");
  revalidatePath("/");

  return {
    status: "success",
    message: "Historico do sorteio salvo com sucesso.",
  };
}

export async function createPesRaffleAction(payload: {
  playerIds: string[];
  numberOfGroups: number;
  teamGroups?: string[];
}): Promise<CreatePesRaffleState> {
  try {
    const game = await createPesGame({
      playerIds: payload.playerIds,
      numberOfGroups: payload.numberOfGroups,
      teamGroups: payload.teamGroups,
    });

    revalidatePath("/raffles");
    revalidatePath("/matches");

    return {
      status: "success",
      message: "Sorteio do PES criado. A fase de grupos ja esta disponivel em Partidas.",
      game,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Nao foi possivel criar o sorteio do PES.",
    };
  }
}
