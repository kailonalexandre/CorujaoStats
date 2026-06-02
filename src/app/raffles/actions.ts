"use server";

import { revalidatePath } from "next/cache";
import { saveRaffleHistory } from "@/lib/db/raffles";
import { saveRaffleHistorySchema, type SaveRaffleHistoryInput } from "@/lib/validations/raffle";

export type SaveRaffleHistoryState = {
  status: "success" | "error";
  message: string;
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
