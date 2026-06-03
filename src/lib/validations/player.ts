import { z } from "zod";
import { emptyStringToUndefined, optionalNonNegativeInt } from "@/lib/validations/shared";

function optionalImagePath(message: string) {
  return z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .refine((value) => {
        if (value.startsWith("/uploads/")) {
          return true;
        }

        return z.string().url().safeParse(value).success;
      }, message)
      .optional(),
  );
}

export const playerSchema = z.object({
  name: z.string({ error: "Informe o nome do jogador." }).trim().min(1, "Informe o nome do jogador."),
  nickname: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  age: optionalNonNegativeInt("Idade").refine((value) => value === undefined || value <= 120, "Informe uma idade valida."),
  photoUrl: optionalImagePath("Envie uma foto valida ou informe uma URL valida."),
  coverUrl: optionalImagePath("Envie uma capa valida ou informe uma URL valida."),
  groupId: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
});

export const playerIdSchema = z.object({
  id: z.string().trim().min(1, "Jogador invalido."),
});

export type PlayerInput = z.infer<typeof playerSchema>;
