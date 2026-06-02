import { updatePesPersistedMatchScore } from "@/modules/pes";
import { emitPesGameStateUpdated } from "@/lib/realtime/pes-realtime";

import {
  errorResponse,
  parseJsonBody,
  pesScoreSchema,
  successResponse,
  type PesRouteContext,
} from "../../../_helpers";

export async function POST(request: Request, context: PesRouteContext) {
  try {
    const { id } = await context.params;
    const payload = pesScoreSchema.parse(await parseJsonBody(request));
    const game = await updatePesPersistedMatchScore({
      sessionId: id,
      ...payload,
    });
    emitPesGameStateUpdated(game);

    return successResponse(game);
  } catch (error) {
    return errorResponse(error, "Nao foi possivel atualizar o placar.");
  }
}
