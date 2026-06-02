import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PlayerPhoto } from "@/components/ui/player-photo";
import { SectionCard } from "@/components/ui/section-card";
import {
  getAverageRanking,
  getKdRanking,
  getSumRanking,
  getWinRanking,
  getWinRateRanking,
  type PlayerMetricRow,
} from "@/lib/db/stats";

export const dynamic = "force-dynamic";

const filters = {
  all: "Todos",
  pes: "PES",
  "mortal-kombat": "Mortal Kombat",
  "cs-go": "CS:GO",
  battlefield: "Battlefield",
} as const;

type FilterSlug = keyof typeof filters;

function getFilter(filter?: string): FilterSlug {
  return filter && Object.hasOwn(filters, filter) ? (filter as FilterSlug) : "all";
}

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function RankingCard({
  title,
  statLabel,
  rows,
  suffix = "",
}: {
  title: string;
  statLabel: string;
  rows: PlayerMetricRow[];
  suffix?: string;
}) {
  return (
    <SectionCard title={title}>
      {rows.length === 0 ? (
        <EmptyState
          title="Ranking vazio"
          description="Registre partidas para gerar este ranking."
        />
      ) : (
        <div className="grid gap-3">
          {rows.map((row, index) => (
            <div
              key={row.player.id}
              className="flex items-center justify-between gap-4 rounded-md bg-white/[0.04] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-7 text-sm font-semibold text-neutral-500">{index + 1}</span>
                <PlayerPhoto name={row.player.name} photoUrl={row.player.photoUrl} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{row.player.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {row.player.nickname || "Sem apelido"}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-neutral-500">{statLabel}</p>
                <p className="text-sm font-semibold text-emerald-200">
                  {formatValue(row.value)}
                  {suffix}
                </p>
                {row.secondary ? <p className="text-xs text-neutral-500">{row.secondary}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

async function AllRankings() {
  const [wins, goals, kills, score] = await Promise.all([
    getWinRanking(["pes", "mortal-kombat", "cs-go", "cs-go-cs2", "battlefield"]),
    getSumRanking(["pes"], "goals"),
    getSumRanking(["cs-go", "cs-go-cs2", "battlefield"], "kills"),
    getSumRanking(["battlefield"], "score"),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <RankingCard title="Vitorias gerais" statLabel="Vitorias" rows={wins} />
      <RankingCard title="Gols no PES" statLabel="Gols" rows={goals} />
      <RankingCard title="Kills FPS" statLabel="Kills" rows={kills} />
      <RankingCard title="Score Battlefield" statLabel="Score" rows={score} />
    </div>
  );
}

async function PesRankings() {
  const [goals, wins, avgGoals] = await Promise.all([
    getSumRanking(["pes"], "goals"),
    getWinRanking(["pes"]),
    getAverageRanking(["pes"], "goals"),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <RankingCard title="Gols" statLabel="Gols" rows={goals} />
      <RankingCard title="Vitorias" statLabel="Vitorias" rows={wins} />
      <RankingCard title="Media de gols" statLabel="Media" rows={avgGoals} />
    </div>
  );
}

async function MortalKombatRankings() {
  const [wins, winRate] = await Promise.all([
    getWinRanking(["mortal-kombat"]),
    getWinRateRanking(["mortal-kombat"]),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <RankingCard title="Vitorias" statLabel="Vitorias" rows={wins} />
      <RankingCard title="Taxa de vitoria" statLabel="Taxa" rows={winRate} suffix="%" />
    </div>
  );
}

async function CsGoRankings() {
  const slugs = ["cs-go", "cs-go-cs2"];
  const [kills, kd, knives, headshots] = await Promise.all([
    getSumRanking(slugs, "kills"),
    getKdRanking(slugs),
    getSumRanking(slugs, "knifeKills"),
    getSumRanking(slugs, "headshots"),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <RankingCard title="Kills" statLabel="Kills" rows={kills} />
      <RankingCard title="K/D" statLabel="K/D" rows={kd} />
      <RankingCard title="Facadas" statLabel="Facadas" rows={knives} />
      <RankingCard title="Headshots" statLabel="Headshots" rows={headshots} />
    </div>
  );
}

async function BattlefieldRankings() {
  const [score, kills, kd] = await Promise.all([
    getSumRanking(["battlefield"], "score"),
    getSumRanking(["battlefield"], "kills"),
    getKdRanking(["battlefield"]),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <RankingCard title="Score" statLabel="Score" rows={score} />
      <RankingCard title="Kills" statLabel="Kills" rows={kills} />
      <RankingCard title="K/D" statLabel="K/D" rows={kd} />
    </div>
  );
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const query = await searchParams;
  const activeFilter = getFilter(query.game);

  return (
    <div>
      <PageHeader
        title="Ranking"
        description="Rankings reais calculados a partir das partidas registradas no banco."
      />

      <nav className="mb-5 flex flex-wrap gap-2">
        {(Object.keys(filters) as FilterSlug[]).map((filter) => (
          <Link
            key={filter}
            href={`/ranking?game=${filter}`}
            className={[
              "h-9 rounded-md px-3 py-2 text-sm font-medium transition",
              activeFilter === filter
                ? "bg-white text-neutral-950"
                : "bg-white/8 text-neutral-300 hover:bg-white/12 hover:text-white",
            ].join(" ")}
          >
            {filters[filter]}
          </Link>
        ))}
      </nav>

      {activeFilter === "all" ? <AllRankings /> : null}
      {activeFilter === "pes" ? <PesRankings /> : null}
      {activeFilter === "mortal-kombat" ? <MortalKombatRankings /> : null}
      {activeFilter === "cs-go" ? <CsGoRankings /> : null}
      {activeFilter === "battlefield" ? <BattlefieldRankings /> : null}
    </div>
  );
}

