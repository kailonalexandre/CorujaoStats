import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PlayerPhoto } from "@/components/ui/player-photo";
import { SectionCard } from "@/components/ui/section-card";
import { MatchForm } from "@/app/matches/_components/match-form";
import { PesTournamentBoard } from "@/app/matches/_components/pes-tournament-board";
import { getRecentMatches } from "@/lib/db/matches";
import { prisma } from "@/lib/db/prisma";
import { getPlayersByDefaultGroup } from "@/lib/db/players";
import { getActivePesGameState } from "@/modules/pes";

export const dynamic = "force-dynamic";

const matchTabs = {
  pes: "PES",
  battlefield: "Battlefield",
  "cs-go": "CS:GO",
  "mortal-kombat": "Mortal Kombat",
} as const;

type MatchTab = keyof typeof matchTabs;

function getMatchTab(tab?: string): MatchTab {
  return tab && Object.hasOwn(matchTabs, tab) ? (tab as MatchTab) : "pes";
}

function gameMatchesTab(gameSlug: string, tab: MatchTab) {
  if (tab === "cs-go") return gameSlug === "cs-go" || gameSlug === "cs-go-cs2";
  return gameSlug === tab;
}

function getTabGameSlugs(tab: MatchTab) {
  return tab === "cs-go" ? ["cs-go", "cs-go-cs2"] : [tab];
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const query = await searchParams;
  const activeTab = getMatchTab(query.tab);
  const activeGameSlugs = getTabGameSlugs(activeTab);
  const [games, players, items, recentMatches, pesGame] = await Promise.all([
    prisma.game.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    getPlayersByDefaultGroup(),
    prisma.gameItem.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    getRecentMatches(activeGameSlugs),
    getActivePesGameState(),
  ]);
  const tabGames = games.filter((game) => gameMatchesTab(game.slug, activeTab));
  const activeGameItems = items.filter((item) => tabGames.some((game) => game.id === item.gameId));
  const hasActivePesTournament = activeTab === "pes" && Boolean(pesGame?.groupData.length);

  return (
    <div>
      <PageHeader
        title="Partidas"
        description="Registre partidas por jogo com campos e estatisticas especificas para cada modalidade."
      />

      <div className="mb-6 overflow-x-auto rounded-lg border border-white/10 bg-neutral-900/80 p-2">
        <nav className="flex min-w-max gap-2">
          {Object.entries(matchTabs).map(([slug, label]) => {
            const selected = slug === activeTab;

            return (
              <Link
                key={slug}
                href={`/matches?tab=${slug}`}
                className={[
                  "inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold transition",
                  selected
                    ? "bg-emerald-500 text-neutral-950"
                    : "text-neutral-300 hover:bg-white/8 hover:text-white",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {games.length === 0 ? (
        <EmptyState
          title="Nenhum jogo cadastrado"
          description="Cadastre jogos antes de registrar partidas."
        />
      ) : players.length === 0 ? (
        <EmptyState
          title="Nenhum jogador cadastrado"
          description="Cadastre jogadores antes de registrar partidas."
        />
      ) : tabGames.length === 0 ? (
        <EmptyState
          title="Jogo nao cadastrado"
          description="Cadastre este jogo em Configuracoes para registrar partidas."
        />
      ) : (
        <div className="grid gap-8">
          {activeTab === "pes" ? <PesTournamentBoard game={pesGame} /> : null}

          {hasActivePesTournament ? (
            <SectionCard
              title="Registro automatico do PES"
              description="As partidas do sorteio ativo sao registradas quando o placar e confirmado no quadro acima."
            >
              <div className="rounded-md border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-100">
                O registro inclui jogador, time sorteado, gols feitos, gols tomados e resultado.
                Esses dados alimentam Ranking, Estatisticas, Dashboard e perfil do jogador.
              </div>
            </SectionCard>
          ) : (
            <MatchForm
              key={activeTab}
              games={tabGames}
              players={players}
              items={activeGameItems}
              initialGameSlug={activeTab}
              showGamePicker={false}
            />
          )}
        </div>
      )}

      <div className="mt-8">
        <SectionCard title="Partidas recentes" description="Ultimos registros salvos em Match e MatchPlayer.">
          {recentMatches.length === 0 ? (
            <EmptyState
              title="Nenhuma partida registrada"
              description="As partidas registradas aparecerao aqui com jogadores, jogo e itens usados."
            />
          ) : (
            <div className="grid gap-4">
              {recentMatches.map((match) => (
                <article key={match.id} className="rounded-md border border-white/8 bg-neutral-950/45 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-white">{match.game.name}</h2>
                      <p className="text-sm text-neutral-400">
                        {match.date.toLocaleDateString("pt-BR")}
                        {match.description ? ` - ${match.description}` : ""}
                      </p>
                    </div>
                    <span className="mt-2 w-fit rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300 sm:mt-0">
                      {match.players.length} jogadores
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {match.players.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 rounded-md border border-white/8 bg-neutral-900/70 p-3">
                        <PlayerPhoto
                          name={entry.player.name}
                          photoUrl={entry.player.photoUrl}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{entry.player.name}</p>
                          <p className="truncate text-xs text-neutral-500">
                            {entry.selectedItem?.name ?? entry.teamName ?? "Sem item"} - {entry.result ?? "-"}
                            {entry.goals !== null && entry.goalsAgainst !== null
                              ? ` - ${entry.goals} x ${entry.goalsAgainst}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

