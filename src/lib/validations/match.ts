import { z } from "zod";
import { emptyStringToUndefined, optionalNonNegativeInt } from "@/lib/validations/shared";

export const matchResultSchema = z.enum(["win", "loss", "draw"], {
  error: "Informe o resultado.",
});

const matchPlayerEntrySchema = z.object({
  playerId: z.string({ error: "Selecione um jogador." }).trim().min(1, "Selecione um jogador."),
  selectedItemId: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  mapItemId: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  classItemId: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  teamName: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  result: matchResultSchema,
  score: optionalNonNegativeInt("Score"),
  kills: optionalNonNegativeInt("Kills"),
  deaths: optionalNonNegativeInt("Deaths"),
  assists: optionalNonNegativeInt("Assists"),
  goals: optionalNonNegativeInt("Gols"),
  goalsAgainst: optionalNonNegativeInt("Gols tomados"),
  knifeKills: optionalNonNegativeInt("KnifeKills"),
  headshots: optionalNonNegativeInt("Headshots"),
  damage: optionalNonNegativeInt("Damage"),
});

export const matchSchema = z.object({
  gameId: z.string({ error: "Selecione um jogo." }).trim().min(1, "Selecione um jogo."),
  gameSlug: z.string({ error: "Jogo invalido." }).trim().min(1, "Jogo invalido."),
  date: z.coerce.date().optional(),
  description: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  players: z.array(matchPlayerEntrySchema).min(1, "Selecione pelo menos um jogador."),
});

export type MatchInput = z.infer<typeof matchSchema>;
