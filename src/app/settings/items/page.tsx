import Link from "next/link";
import { GameItemType } from "@prisma/client";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CreateGameItemForm } from "@/app/settings/items/_components/create-game-item-form";
import { GameItemCard } from "@/app/settings/items/_components/game-item-card";
import { GameItemFilters } from "@/app/settings/items/_components/game-item-filters";
import { getGameItems, getGamesForItems } from "@/lib/db/game-items";
import { getGameItemTypeLabel } from "@/lib/game-item-labels";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 8;

function parsePage(value?: string) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function buildItemsHref(params: {
  gameId?: string;
  type?: string;
  page?: number;
  tab?: string;
}) {
  const search = new URLSearchParams();

  if (params.gameId) {
    search.set("gameId", params.gameId);
  }

  if (params.type) {
    search.set("type", params.type);
  }

  if (params.tab && params.tab !== "items") {
    search.set("tab", params.tab);
  }

  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }

  const query = search.toString();
  return query ? `/settings/items?${query}` : "/settings/items";
}

export default async function SettingsItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ gameId?: string; type?: string; page?: string; tab?: string }>;
}) {
  await requirePermission("manage_items");

  const query = await searchParams;
  const games = await getGamesForItems();
  const types = Object.values(GameItemType);
  const activeTab = query.tab === "summary" ? "summary" : "items";
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
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(parsePage(query.page), totalPages);
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(pageStart, pageStart + ITEMS_PER_PAGE);
  const firstVisibleItem = items.length === 0 ? 0 : pageStart + 1;
  const lastVisibleItem = Math.min(pageStart + ITEMS_PER_PAGE, items.length);
  const itemsByGame = games.map((game) => ({
    id: game.id,
    name: game.name,
    total: items.filter((item) => item.gameId === game.id).length,
  }));
  const itemsByType = types.map((type) => ({
    type,
    label: getGameItemTypeLabel(type),
    total: items.filter((item) => item.type === type).length,
  }));

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

        <section className="min-w-0">
          {games.length === 0 ? (
            <div className="grid gap-4">
              <EmptyState
                title="Nenhum jogo cadastrado"
                description="Cadastre jogos antes de adicionar itens sorteaveis."
              />
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/settings/games"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 bg-emerald-500 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
                >
                  Cadastrar jogo
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-lg border border-white/10 bg-neutral-900">
                <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Organizacao dos itens</h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Navegue pelos itens cadastrados sem perder os filtros selecionados.
                    </p>
                  </div>

                  <div className="flex rounded-md border border-white/10 bg-neutral-950 p-1">
                    <Link
                      href={buildItemsHref({
                        gameId: selectedGameId,
                        type: selectedType,
                        page: currentPage,
                      })}
                      className={[
                        "h-9 rounded px-3 py-2 text-sm font-medium transition",
                        activeTab === "items"
                          ? "bg-emerald-500 text-neutral-950"
                          : "text-neutral-300 hover:bg-white/8 hover:text-white",
                      ].join(" ")}
                    >
                      Itens cadastrados
                    </Link>
                    <Link
                      href={buildItemsHref({
                        gameId: selectedGameId,
                        type: selectedType,
                        tab: "summary",
                      })}
                      className={[
                        "h-9 rounded px-3 py-2 text-sm font-medium transition",
                        activeTab === "summary"
                          ? "bg-emerald-500 text-neutral-950"
                          : "text-neutral-300 hover:bg-white/8 hover:text-white",
                      ].join(" ")}
                    >
                      Resumo
                    </Link>
                  </div>
                </div>

                {activeTab === "summary" ? (
                  <div className="grid gap-4 p-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-4">
                      <h3 className="text-sm font-semibold uppercase text-neutral-300">Por jogo</h3>
                      <div className="mt-4 grid gap-2">
                        {itemsByGame.map((game) => (
                          <div
                            key={game.id}
                            className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2 text-sm"
                          >
                            <span className="text-neutral-300">{game.name}</span>
                            <span className="font-semibold text-white">{game.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-4">
                      <h3 className="text-sm font-semibold uppercase text-neutral-300">Por tipo</h3>
                      <div className="mt-4 grid gap-2">
                        {itemsByType.map((type) => (
                          <div
                            key={type.type}
                            className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2 text-sm"
                          >
                            <span className="text-neutral-300">{type.label}</span>
                            <span className="font-semibold text-white">{type.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      title="Nenhum item encontrado"
                      description="Cadastre um item para o jogo selecionado ou ajuste os filtros."
                    />
                  </div>
                ) : (
                  <div className="grid gap-4 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-neutral-400">
                        Mostrando {firstVisibleItem}-{lastVisibleItem} de {items.length} itens
                      </p>

                      <div className="flex items-center gap-2">
                        <Link
                          aria-disabled={currentPage === 1}
                          href={buildItemsHref({
                            gameId: selectedGameId,
                            type: selectedType,
                            page: Math.max(1, currentPage - 1),
                          })}
                          className={[
                            "inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm font-medium transition",
                            currentPage === 1
                              ? "pointer-events-none text-neutral-600"
                              : "text-neutral-200 hover:bg-white/8",
                          ].join(" ")}
                        >
                          Anterior
                        </Link>
                        <span className="rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-300">
                          Pagina {currentPage} de {totalPages}
                        </span>
                        <Link
                          aria-disabled={currentPage === totalPages}
                          href={buildItemsHref({
                            gameId: selectedGameId,
                            type: selectedType,
                            page: Math.min(totalPages, currentPage + 1),
                          })}
                          className={[
                            "inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm font-medium transition",
                            currentPage === totalPages
                              ? "pointer-events-none text-neutral-600"
                              : "text-neutral-200 hover:bg-white/8",
                          ].join(" ")}
                        >
                          Proxima
                        </Link>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      {paginatedItems.map((item) => (
                        <GameItemCard key={item.id} item={item} games={games} types={types} />
                      ))}
                    </div>

                    {totalPages > 1 ? (
                      <div className="flex flex-wrap justify-center gap-2 border-t border-white/10 pt-4">
                        {Array.from({ length: totalPages }).map((_, index) => {
                          const page = index + 1;

                          return (
                            <Link
                              key={page}
                              href={buildItemsHref({
                                gameId: selectedGameId,
                                type: selectedType,
                                page,
                              })}
                              className={[
                                "grid size-9 place-items-center rounded-md text-sm font-semibold transition",
                                currentPage === page
                                  ? "bg-emerald-500 text-neutral-950"
                                  : "border border-white/10 text-neutral-300 hover:bg-white/8",
                              ].join(" ")}
                            >
                              {page}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
