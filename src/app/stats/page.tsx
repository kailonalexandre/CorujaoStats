import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PlayerPhoto } from "@/components/ui/player-photo";
import { SectionCard } from "@/components/ui/section-card";
import {
  getAverageRanking,
  getFightTotals,
  getKdRanking,
  getMostUsedItemByPlayer,
  getPopularBattlefieldMaps,
  getPopularSelectedItems,
  getSumRanking,
  getWinRanking,
  getWinRateRanking,
  type MostUsedItemRow,
  type PlayerMetricRow,
  type PopularItemRow,
} from "@/lib/db/stats";

export const dynamic = "force-dynamic";

const tabs = {
  pes: "PES",
  "mortal-kombat": "Mortal Kombat",
  "cs-go": "CS:GO",
  battlefield: "Battlefield",
} as const;

type TabSlug = keyof typeof tabs;

function getTab(tab?: string): TabSlug {
  return tab && Object.hasOwn(tabs, tab) ? (tab as TabSlug) : "pes";
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function PlayerRanking({
  title,
  rows,
  suffix = "",
}: {
  title: string;
  rows: PlayerMetricRow[];
  suffix?: string;
}) {
  return (
    <SectionCard title={title}>
      {rows.length === 0 ? (
        <EmptyState title="Sem dados" description="Registre partidas para gerar este ranking." />
      ) : (
        <div className="grid gap-3">
          {rows.map((row, index) => (
            <div
              key={row.player.id}
              className="flex items-center justify-between gap-4 rounded-md bg-white/[0.04] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 text-sm font-semibold text-neutral-500">{index + 1}</span>
                <PlayerPhoto name={row.player.name} photoUrl={row.player.photoUrl} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{row.player.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {row.secondary ?? row.player.nickname ?? "Sem apelido"}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-emerald-200">
                {formatNumber(row.value)}
                {suffix}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function MostUsedByPlayer({ title, rows }: { title: string; rows: MostUsedItemRow[] }) {
  return (
    <SectionCard title={title}>
      {rows.length === 0 ? (
        <EmptyState title="Sem dados" description="Os itens mais usados aparecerao apos registrar partidas." />
      ) : (
        <div className="grid gap-3">
          {rows.map((row) => (
            <div
              key={`${row.player.id}-${row.itemName}`}
              className="flex items-center justify-between gap-4 rounded-md bg-white/[0.04] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <PlayerPhoto name={row.player.name} photoUrl={row.player.photoUrl} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{row.player.name}</p>
                  <p className="truncate text-xs text-neutral-500">{row.itemName}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-emerald-200">{row.count} usos</span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function PopularItems({ title, rows }: { title: string; rows: PopularItemRow[] }) {
  return (
    <SectionCard title={title}>
      {rows.length === 0 ? (
        <EmptyState title="Sem dados" description="Registre partidas para gerar esta lista." />
      ) : (
        <div className="grid gap-3">
          {rows.map((row, index) => (
            <div
              key={row.itemName}
              className="flex items-center justify-between rounded-md bg-white/[0.04] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {index + 1}. {row.itemName}
                </p>
              </div>
              <span className="text-sm font-semibold text-emerald-200">{row.count} partidas</span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

async function PesStats() {
  const [goals, wins, avgGoals, teams] = await Promise.all([
    getSumRanking(["pes"], "goals"),
    getWinRanking(["pes"]),
    getAverageRanking(["pes"], "goals"),
    getMostUsedItemByPlayer(["pes"], "team"),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <PlayerRanking title="Ranking por gols" rows={goals} />
      <PlayerRanking title="Ranking por vitorias" rows={wins} />
      <PlayerRanking title="Media de gols por partida" rows={avgGoals} />
      <MostUsedByPlayer title="Times mais usados por jogador" rows={teams} />
    </div>
  );
}

async function MortalKombatStats() {
  const [wins, fights, winRate, characters] = await Promise.all([
    getWinRanking(["mortal-kombat"]),
    getFightTotals(["mortal-kombat"]),
    getWinRateRanking(["mortal-kombat"]),
    getMostUsedItemByPlayer(["mortal-kombat"], "character"),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <PlayerRanking title="Ranking por vitorias" rows={wins} />
      <PlayerRanking title="Total de lutas" rows={fights} />
      <PlayerRanking title="Taxa de vitoria" rows={winRate} suffix="%" />
      <MostUsedByPlayer title="Personagem mais usado por jogador" rows={characters} />
    </div>
  );
}

async function CsGoStats() {
  const slugs = ["cs-go", "cs-go-cs2"];
  const [kills, avgKills, avgDeaths, kd, knives, headshots, maps] = await Promise.all([
    getSumRanking(slugs, "kills"),
    getAverageRanking(slugs, "kills"),
    getAverageRanking(slugs, "deaths"),
    getKdRanking(slugs),
    getSumRanking(slugs, "knifeKills"),
    getSumRanking(slugs, "headshots"),
    getPopularSelectedItems(slugs, "map"),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <PlayerRanking title="Ranking por kills" rows={kills} />
      <PlayerRanking title="Media de kills" rows={avgKills} />
      <PlayerRanking title="Media de deaths" rows={avgDeaths} />
      <PlayerRanking title="K/D ratio" rows={kd} />
      <PlayerRanking title="Total de facadas" rows={knives} />
      <PlayerRanking title="Total de headshots" rows={headshots} />
      <PopularItems title="Mapas mais jogados" rows={maps} />
    </div>
  );
}

async function BattlefieldStats() {
  const [score, kills, avgKills, avgDeaths, kd, classes, maps] = await Promise.all([
    getSumRanking(["battlefield"], "score"),
    getSumRanking(["battlefield"], "kills"),
    getAverageRanking(["battlefield"], "kills"),
    getAverageRanking(["battlefield"], "deaths"),
    getKdRanking(["battlefield"]),
    getPopularSelectedItems(["battlefield"], "class"),
    getPopularBattlefieldMaps(),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <PlayerRanking title="Ranking por score" rows={score} />
      <PlayerRanking title="Ranking por kills" rows={kills} />
      <PlayerRanking title="Media de kills" rows={avgKills} />
      <PlayerRanking title="Media de deaths" rows={avgDeaths} />
      <PlayerRanking title="K/D ratio" rows={kd} />
      <PopularItems title="Classes mais usadas" rows={classes} />
      <PopularItems title="Mapas mais jogados" rows={maps} />
    </div>
  );
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const query = await searchParams;
  const activeTab = getTab(query.tab);

  return (
    <div>
      <PageHeader
        title="Estatisticas"
        description="Estatisticas separadas por jogo, calculadas a partir de Match e MatchPlayer."
      />

      <nav className="mb-5 flex flex-wrap gap-2">
        {(Object.keys(tabs) as TabSlug[]).map((tab) => (
          <Link
            key={tab}
            href={`/stats?tab=${tab}`}
            className={[
              "h-9 rounded-md px-3 py-2 text-sm font-medium transition",
              activeTab === tab
                ? "bg-white text-neutral-950"
                : "bg-white/8 text-neutral-300 hover:bg-white/12 hover:text-white",
            ].join(" ")}
          >
            {tabs[tab]}
          </Link>
        ))}
      </nav>

      {activeTab === "pes" ? <PesStats /> : null}
      {activeTab === "mortal-kombat" ? <MortalKombatStats /> : null}
      {activeTab === "cs-go" ? <CsGoStats /> : null}
      {activeTab === "battlefield" ? <BattlefieldStats /> : null}
    </div>
  );
}

