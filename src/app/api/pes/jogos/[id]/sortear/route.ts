import { sortPesGame } from "@/modules/pes";
import { emitPesGameStateUpdated } from "@/lib/realtime/pes-realtime";

import {
  errorResponse,
  parseJsonBody,
  pesSortSchema,
  successResponse,
  type PesRouteContext,
} from "../../../_helpers";

export async function POST(request: Request, context: PesRouteContext) {
  try {
    const { id } = await context.params;
    const payload = pesSortSchema.parse(await parseJsonBody(request));
    const game = await sortPesGame({
      sessionId: id,
      ...payload,
    });
    emitPesGameStateUpdated(game);

    return successResponse(game);
  } catch (error) {
    return errorResponse(error, "Nao foi possivel sortear o jogo de PES.");
  }
}
