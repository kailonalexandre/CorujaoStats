import { type NextRequest } from "next/server";

import { getPesGameStateById } from "@/modules/pes";

import { errorResponse, successResponse, type PesRouteContext } from "../../_helpers";

export async function GET(request: NextRequest, context: PesRouteContext) {
  try {
    const { id } = await context.params;
    const groupId = request.nextUrl.searchParams.get("groupId") ?? undefined;
    const game = await getPesGameStateById(id, groupId);

    if (!game) {
      return errorResponse(new Error("Jogo ativo de PES nao encontrado."), undefined, 404);
    }

    return successResponse(game);
  } catch (error) {
    return errorResponse(error, "Nao foi possivel carregar o jogo de PES.");
  }
}
