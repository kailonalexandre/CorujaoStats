import { type NextRequest } from "next/server";

import {
  createPesGameSession,
  listActivePesGameStates,
} from "@/modules/pes";
import { emitPesGamesUpdated } from "@/lib/realtime/pes-realtime";

import {
  errorResponse,
  parseJsonBody,
  pesCreateGameSchema,
  successResponse,
} from "../_helpers";

export async function GET(request: NextRequest) {
  try {
    const groupId = request.nextUrl.searchParams.get("groupId") ?? undefined;
    const games = await listActivePesGameStates(groupId);

    return successResponse(games);
  } catch (error) {
    return errorResponse(error, "Nao foi possivel listar os jogos ativos de PES.");
  }
}

export async function POST(request: Request) {
  try {
    const payload = pesCreateGameSchema.parse(await parseJsonBody(request));
    const game = await createPesGameSession(payload);
    emitPesGamesUpdated(await listActivePesGameStates(payload.groupId), payload.groupId);

    return successResponse(game, 201);
  } catch (error) {
    return errorResponse(error, "Nao foi possivel criar o jogo de PES.");
  }
}
