import { z } from "zod";
import { emptyStringToUndefined, optionalUrl } from "@/lib/validations/shared";

export const gameSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do jogo."),
  slug: z
    .string()
    .trim()
    .min(2, "Informe o slug.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minusculas, numeros e hifens."),
  description: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
});

export const gameItemSchema = z.object({
  gameId: z.string({ error: "Selecione um jogo." }).trim().min(1, "Selecione um jogo."),
  name: z.string({ error: "Informe o nome do item." }).trim().min(1, "Informe o nome do item."),
  type: z.enum(["team", "character", "map", "class", "weapon", "other"], {
    error: "Selecione um tipo de item.",
  }),
  groupName: z.preprocess(emptyStringToUndefined, z.string().trim().max(80, "Use ate 80 caracteres.").optional()),
  imageUrl: optionalUrl("Informe uma URL valida para a imagem."),
  active: z.boolean({ error: "Informe se o item esta ativo." }).default(true),
});

export const gameItemIdSchema = z.object({
  id: z.string().trim().min(1, "Item invalido."),
});

export type GameInput = z.infer<typeof gameSchema>;
export type GameItemInput = z.infer<typeof gameItemSchema>;
