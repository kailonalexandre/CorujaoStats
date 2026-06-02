import { NextResponse } from "next/server";
import { z } from "zod";

export const pesCreateGameSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome para o jogo.").max(80).optional(),
  useRepechage: z.boolean().optional(),
  groupId: z.string().trim().min(1).optional(),
});

export const pesSortSchema = z.object({
  playerIds: z.array(z.string().trim().min(1)).min(1, "Selecione pelo menos um jogador."),
  numberOfGroups: z.number().int("A quantidade de grupos deve ser inteira.").min(1, "Informe pelo menos 1 grupo."),
  useRepechage: z.boolean().optional(),
  groupId: z.string().trim().min(1).optional(),
});

export const pesScoreSchema = z.object({
  matchId: z.string().trim().min(1, "Informe a partida."),
  goals1: z.number().int("O placar deve ser inteiro.").min(0, "O placar nao pode ser negativo."),
  goals2: z.number().int("O placar deve ser inteiro.").min(0, "O placar nao pode ser negativo."),
  pen1: z.number().int("Os penaltis devem ser inteiros.").min(0).nullable().optional(),
  pen2: z.number().int("Os penaltis devem ser inteiros.").min(0).nullable().optional(),
  groupId: z.string().trim().min(1).optional(),
});

export type PesRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    {
      status,
    },
  );
}

export function errorResponse(error: unknown, fallback = "Nao foi possivel processar a solicitacao.", status = 400) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        ok: false,
        message: error.issues[0]?.message ?? "Revise os dados enviados.",
        issues: error.issues,
      },
      {
        status: 422,
      },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message: error instanceof Error ? error.message : fallback,
    },
    {
      status,
    },
  );
}

export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new Error("Envie um JSON valido no corpo da requisicao.");
  }
}
