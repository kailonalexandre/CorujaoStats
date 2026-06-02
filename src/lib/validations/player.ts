import { z } from "zod";
import { emptyStringToUndefined, optionalUrl } from "@/lib/validations/shared";

export const playerSchema = z.object({
  name: z.string({ error: "Informe o nome do jogador." }).trim().min(1, "Informe o nome do jogador."),
  nickname: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  photoUrl: optionalUrl("Informe uma URL valida para a foto."),
  groupId: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
});

export const playerIdSchema = z.object({
  id: z.string().trim().min(1, "Jogador invalido."),
});

export type PlayerInput = z.infer<typeof playerSchema>;
