import Image from "next/image";
import type { Game, GameItem, GameItemType } from "@prisma/client";
import { ImageIcon, Pencil } from "lucide-react";
import { EditGameItemForm } from "@/app/settings/items/_components/edit-game-item-form";
import { ToggleGameItemActiveButton } from "@/app/settings/items/_components/toggle-game-item-active-button";
import { getGameItemTypeLabel } from "@/lib/game-item-labels";

type GameItemCardProps = {
  item: GameItem & {
    game: Game;
  };
  games: Game[];
  types: GameItemType[];
};

export function GameItemCard({ item, games, types }: GameItemCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-neutral-900 p-5">
      <div className="flex gap-4">
        <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-md border border-white/10 bg-neutral-800 text-neutral-500">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <ImageIcon size={22} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-white">{item.name}</h2>
            <span
              className={[
                "rounded-md px-2 py-1 text-xs font-semibold",
                item.active
                  ? "bg-emerald-500/10 text-emerald-200"
                  : "bg-neutral-700 text-neutral-300",
              ].join(" ")}
            >
              {item.active ? "Ativo" : "Inativo"}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">{item.game.name}</p>
          <p className="mt-2 text-xs uppercase text-neutral-500">{getGameItemTypeLabel(item.type)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <details>
          <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-medium text-neutral-200 transition hover:bg-white/8">
            <Pencil size={16} />
            Editar
          </summary>
          <EditGameItemForm item={item} games={games} types={types} />
        </details>

        <ToggleGameItemActiveButton itemId={item.id} active={item.active} />
      </div>
    </article>
  );
}
