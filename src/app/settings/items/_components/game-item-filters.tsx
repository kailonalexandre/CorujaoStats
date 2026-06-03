import Link from "next/link";
import type { Game, GameItemType } from "@prisma/client";
import { getGameItemTypeLabel } from "@/lib/game-item-labels";

type GameItemFiltersProps = {
  games: Game[];
  types: GameItemType[];
  selectedGameId?: string;
  selectedType?: string;
};

function buildHref(gameId?: string, type?: string) {
  const params = new URLSearchParams();

  if (gameId) {
    params.set("gameId", gameId);
  }

  if (type) {
    params.set("type", type);
  }

  const query = params.toString();
  return query ? `/settings/items?${query}` : "/settings/items";
}

export function GameItemFilters({
  games,
  types,
  selectedGameId,
  selectedType,
}: GameItemFiltersProps) {
  return (
    <div className="grid gap-4 rounded-lg border border-white/10 bg-neutral-900 p-5">
      <div>
        <h2 className="text-base font-semibold text-white">Filtros</h2>
        <p className="mt-1 text-sm text-neutral-400">Selecione um jogo e filtre os itens por tipo.</p>
      </div>

      <div className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref(undefined, selectedType)}
            className={[
              "h-9 rounded-md px-3 py-2 text-sm font-medium transition",
              !selectedGameId ? "bg-white text-neutral-950" : "bg-white/8 text-neutral-300 hover:bg-white/12",
            ].join(" ")}
          >
            Todos os jogos
          </Link>
          {games.map((game) => (
            <Link
              key={game.id}
              href={buildHref(game.id, selectedType)}
              className={[
                "h-9 rounded-md px-3 py-2 text-sm font-medium transition",
                selectedGameId === game.id
                  ? "bg-white text-neutral-950"
                  : "bg-white/8 text-neutral-300 hover:bg-white/12",
              ].join(" ")}
            >
              {game.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref(selectedGameId)}
            className={[
              "h-9 rounded-md px-3 py-2 text-sm font-medium transition",
              !selectedType ? "bg-emerald-500 text-neutral-950" : "bg-white/8 text-neutral-300 hover:bg-white/12",
            ].join(" ")}
          >
            Todos os tipos
          </Link>
          {types.map((type) => (
            <Link
              key={type}
              href={buildHref(selectedGameId, type)}
              className={[
                "h-9 rounded-md px-3 py-2 text-sm font-medium transition",
                selectedType === type
                  ? "bg-emerald-500 text-neutral-950"
                  : "bg-white/8 text-neutral-300 hover:bg-white/12",
              ].join(" ")}
            >
              {getGameItemTypeLabel(type)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
