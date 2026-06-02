import Link from "next/link";
import { GameItemType } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PlayerPhoto } from "@/components/ui/player-photo";
import { SectionCard } from "@/components/ui/section-card";
import { getRaffleHistory, getRaffleHistoryFilters } from "@/lib/db/raffles";

export const dynamic = "force-dynamic";

type HistoryRow = Awaited<ReturnType<typeof getRaffleHistory>>[number];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function isCsGo(row: HistoryRow) {
  return row.game.slug === "cs-go" || row.game.slug === "cs-go-cs2";
}

function groupCsGoDraws(rows: HistoryRow[]) {
  const groups = new Map<string, HistoryRow[]>();

  for (const row of rows.filter(isCsGo)) {
    const key = row.drawId ?? `${row.gameId}-${row.itemId}-${row.createdAt.toISOString()}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  return [...groups.values()];
}

function Filters({
  games,
  players,
  query,
}: {
  games: Awaited<ReturnType<typeof getRaffleHistoryFilters>>["games"];
  players: Awaited<ReturnType<typeof getRaffleHistoryFilters>>["players"];
  query: { gameId?: string; playerId?: string; date?: string; itemType?: string };
}) {
  return (
    <form className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-neutral-900 p-5 md:grid-cols-5">
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">Jogo</span>
        <select name="gameId" defaultValue={query.gameId ?? ""} className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-white">
          <option value="">Todos</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">Jogador</span>
        <select name="playerId" defaultValue={query.playerId ?? ""} className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-white">
          <option value="">Todos</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">Data</span>
        <input
          type="date"
          name="date"
          defaultValue={query.date ?? ""}
          className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-white"
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-neutral-200">Tipo</span>
        <select name="itemType" defaultValue={query.itemType ?? ""} className="h-10 rounded-md border border-white/10 bg-neutral-950 px-3 text-white">
          <option value="">Todos</option>
          {Object.values(GameItemType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end gap-2">
        <button className="h-10 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-neutral-950" type="submit">
          Filtrar
        </button>
        <Link href="/raffles/history" className="grid h-10 place-items-center rounded-md border border-white/10 px-4 text-sm text-neutral-200">
          Limpar
        </Link>
      </div>
    </form>
  );
}

function StandardHistory({ rows }: { rows: HistoryRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="Sem historico" description="Nenhum sorteio encontrado para os filtros selecionados." />;
  }

  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <article key={row.id} className="grid gap-3 rounded-md bg-white/[0.04] p-4 md:grid-cols-[160px_1fr_1fr_1fr] md:items-center">
          <div>
            <p className="text-xs uppercase text-neutral-500">Data</p>
            <p className="text-sm text-white">{formatDate(row.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-500">Jogo</p>
            <p className="text-sm font-medium text-white">{row.game.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {row.player ? <PlayerPhoto name={row.player.name} photoUrl={row.player.photoUrl} size="sm" /> : null}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{row.player?.name ?? "-"}</p>
              <p className="truncate text-xs text-neutral-500">{row.player?.nickname ?? "Sem apelido"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-500">Item / Grupo</p>
            <p className="text-sm font-medium text-emerald-200">{row.item?.name ?? "-"}</p>
            <p className="text-xs text-neutral-500">{row.groupName ?? "-"}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function CsGoHistory({ draws }: { draws: HistoryRow[][] }) {
  if (draws.length === 0) {
    return <EmptyState title="Sem historico de CS:GO" description="Nenhum sorteio de times encontrado." />;
  }

  return (
    <div className="grid gap-4">
      {draws.map((draw) => {
        const first = draw[0];
        const teamA = draw.filter((row) => row.groupName === "Time A");
        const teamB = draw.filter((row) => row.groupName === "Time B");

        return (
          <article key={first.drawId ?? first.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase text-neutral-500">Mapa sorteado</p>
                <h2 className="text-2xl font-semibold text-white">{first.item?.name ?? "-"}</h2>
              </div>
              <p className="text-sm text-neutral-400">{formatDate(first.createdAt)}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Time A", teamA],
                ["Time B", teamB],
              ].map(([teamName, players]) => (
                <div key={teamName as string} className="rounded-md bg-neutral-950/50 p-4">
                  <h3 className="text-base font-semibold text-white">{teamName as string}</h3>
                  <div className="mt-3 grid gap-3">
                    {(players as HistoryRow[]).map((row) => (
                      <div key={row.id} className="flex items-center gap-3">
                        {row.player ? <PlayerPhoto name={row.player.name} photoUrl={row.player.photoUrl} size="sm" /> : null}
                        <span className="text-sm font-medium text-white">{row.player?.name ?? "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default async function RaffleHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ gameId?: string; playerId?: string; date?: string; itemType?: string }>;
}) {
  const query = await searchParams;
  const [filters, rows] = await Promise.all([
    getRaffleHistoryFilters(),
    getRaffleHistory(query),
  ]);
  const csGoDraws = groupCsGoDraws(rows);
  const standardRows = rows.filter((row) => !isCsGo(row));

  return (
    <div>
      <PageHeader
        title="Historico de sorteios"
        description="Consulte sorteios salvos por jogo, jogador, data e tipo de item."
        action={
          <Link href="/raffles" className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-medium text-neutral-200 transition hover:bg-white/8">
            <ArrowLeft size={17} />
            Sorteios
          </Link>
        }
      />

      <Filters games={filters.games} players={filters.players} query={query} />

      <div className="grid gap-6">
        <SectionCard title="CS:GO" description="Sorteios agrupados por mapa e times.">
          <CsGoHistory draws={csGoDraws} />
        </SectionCard>

        <SectionCard title="Outros sorteios" description="PES, Mortal Kombat, Battlefield e demais jogos.">
          <StandardHistory rows={standardRows} />
        </SectionCard>
      </div>
    </div>
  );
}

