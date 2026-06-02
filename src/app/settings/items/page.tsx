import { GameItemType } from "@prisma/client";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CreateGameItemForm } from "@/app/settings/items/_components/create-game-item-form";
import { GameItemCard } from "@/app/settings/items/_components/game-item-card";
import { GameItemFilters } from "@/app/settings/items/_components/game-item-filters";
import { getGameItems, getGamesForItems } from "@/lib/db/game-items";

export const dynamic = "force-dynamic";

export default async function SettingsItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ gameId?: string; type?: string }>;
}) {
  const query = await searchParams;
  const games = await getGamesForItems();
  const types = Object.values(GameItemType);
  const selectedGameId = games.some((game) => game.id === query.gameId)
    ? query.gameId
    : undefined;
  const selectedType = types.includes(query.type as GameItemType)
    ? (query.type as GameItemType)
    : undefined;
  const items = await getGameItems({
    gameId: selectedGameId,
    type: selectedType,
  });

  return (
    <div>
      <PageHeader
        title="Itens sorteaveis"
        description="Gerencie times, personagens, mapas, classes, armas e outros itens usados nos sorteios."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="grid content-start gap-4">
          <CreateGameItemForm
            games={games}
            types={types}
            selectedGameId={selectedGameId}
          />
          <GameItemFilters
            games={games}
            types={types}
            selectedGameId={selectedGameId}
            selectedType={selectedType}
          />
        </div>

        <section>
          {games.length === 0 ? (
            <EmptyState
              title="Nenhum jogo cadastrado"
              description="Cadastre jogos antes de adicionar itens sorteaveis."
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="Nenhum item encontrado"
              description="Cadastre um item para o jogo selecionado ou ajuste os filtros."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {items.map((item) => (
                <GameItemCard key={item.id} item={item} games={games} types={types} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
