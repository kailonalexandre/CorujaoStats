import { z } from "zod";

export const raffleHistoryEntrySchema = z.object({
  drawId: z.string().trim().optional(),
  groupId: z.string().trim().optional(),
  gameId: z.string().trim().min(1),
  playerId: z.string().trim().min(1).optional(),
  itemId: z.string().trim().min(1).optional(),
  groupName: z.string().trim().optional(),
});

export const saveRaffleHistorySchema = z.object({
  entries: z.array(raffleHistoryEntrySchema).min(1, "Realize um sorteio antes de salvar."),
});

export type SaveRaffleHistoryInput = z.infer<typeof saveRaffleHistorySchema>;
