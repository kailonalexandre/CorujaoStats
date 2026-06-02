import { resetPesGameById } from "@/modules/pes";
import { emitPesGameStateUpdated } from "@/lib/realtime/pes-realtime";

import { errorResponse, successResponse, type PesRouteContext } from "../../../_helpers";

export async function POST(request: Request, context: PesRouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId") ?? undefined;
    const game = await resetPesGameById(id, groupId);

    if (!game) {
      return errorResponse(new Error("Jogo ativo de PES nao encontrado."), undefined, 404);
    }

    emitPesGameStateUpdated(game);

    return successResponse(game);
  } catch (error) {
    return errorResponse(error, "Nao foi possivel resetar o jogo de PES.");
  }
}
