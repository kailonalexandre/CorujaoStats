import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PlayerPhoto } from "@/components/ui/player-photo";
import { SectionCard } from "@/components/ui/section-card";
import { MatchForm } from "@/app/matches/_components/match-form";
import { getRecentMatches } from "@/lib/db/matches";
import { prisma } from "@/lib/db/prisma";
import { getPlayersByDefaultGroup } from "@/lib/db/players";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const [games, players, items, recentMatches] = await Promise.all([
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
    getRecentMatches(),
  ]);

  return (
    <div>
      <PageHeader
        title="Partidas"
        description="Registre partidas por jogo com campos e estatisticas especificas para cada modalidade."
      />

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
      ) : (
        <MatchForm games={games} players={players} items={items} />
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
                <article key={match.id} className="rounded-md bg-white/[0.04] p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-white">{match.game.name}</h2>
                      <p className="text-sm text-neutral-400">
                        {match.date.toLocaleDateString("pt-BR")}
                        {match.description ? ` - ${match.description}` : ""}
                      </p>
                    </div>
                    <span className="text-sm text-neutral-500">{match.players.length} jogadores</span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {match.players.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 rounded-md bg-neutral-950/50 p-3">
                        <PlayerPhoto
                          name={entry.player.name}
                          photoUrl={entry.player.photoUrl}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{entry.player.name}</p>
                          <p className="truncate text-xs text-neutral-500">
                            {entry.selectedItem?.name ?? entry.teamName ?? "Sem item"} - {entry.result ?? "-"}
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

