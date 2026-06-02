import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PlayerPhoto } from "@/components/ui/player-photo";
import { SectionCard } from "@/components/ui/section-card";
import { prisma } from "@/lib/db/prisma";
import { getPlayerById } from "@/lib/db/players";

export const dynamic = "force-dynamic";

type MatchPlayerWithRelations = Awaited<ReturnType<typeof getPlayerMatches>>[number];

const tabLabels = {
  geral: "Geral",
  pes: "PES",
  "mortal-kombat": "Mortal Kombat",
  "cs-go": "CS:GO",
  battlefield: "Battlefield",
} as const;

type TabSlug = keyof typeof tabLabels;

const gameTabs: TabSlug[] = ["pes", "mortal-kombat", "cs-go", "battlefield"];

function getValidTab(tab?: string): TabSlug {
  if (tab && Object.hasOwn(tabLabels, tab)) {
    return tab as TabSlug;
  }

  return "geral";
}

function getPlayerMatches(playerId: string) {
  return prisma.matchPlayer.findMany({
    where: {
      playerId,
    },
    include: {
      match: {
        include: {
          game: true,
        },
      },
      selectedItem: true,
    },
    orderBy: {
      match: {
        date: "desc",
      },
    },
  });
}

function percentage(value: number, total: number) {
  if (total === 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

function numberValue(value?: number | null) {
  return value ?? 0;
}

function sum(matches: MatchPlayerWithRelations[], key: keyof MatchPlayerWithRelations) {
  return matches.reduce((total, match) => {
    const value = match[key];
    return typeof value === "number" ? total + value : total;
  }, 0);
}

function getBaseStats(matches: MatchPlayerWithRelations[]) {
  const total = matches.length;
  const wins = matches.filter((match) => match.result === "win").length;
  const losses = matches.filter((match) => match.result === "loss").length;
  const draws = matches.filter((match) => match.result === "draw").length;

  return {
    total,
    wins,
    losses,
    draws,
    winRate: percentage(wins, total),
  };
}

function getMostUsedItems(matches: MatchPlayerWithRelations[]) {
  const counts = new Map<string, { name: string; type: string; count: number }>();

  for (const match of matches) {
    if (!match.selectedItem) {
      continue;
    }

    const current = counts.get(match.selectedItem.id);
    counts.set(match.selectedItem.id, {
      name: match.selectedItem.name,
      type: match.selectedItem.type,
      count: current ? current.count + 1 : 1,
    });
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 6);
}

function getGameSpecificStats(slug: TabSlug, matches: MatchPlayerWithRelations[]) {
  const base = getBaseStats(matches);
  const kills = sum(matches, "kills");
  const deaths = sum(matches, "deaths");
  const goals = sum(matches, "goals");
  const score = sum(matches, "score");
  const assists = sum(matches, "assists");
  const headshots = sum(matches, "headshots");
  const knifeKills = sum(matches, "knifeKills");
  const kdRatio = deaths === 0 ? String(kills) : (kills / deaths).toFixed(2);

  if (slug === "pes") {
    return [
      { label: "Partidas", value: String(base.total) },
      { label: "Vitorias", value: String(base.wins) },
      { label: "Derrotas", value: String(base.losses) },
      { label: "Empates", value: String(base.draws) },
      { label: "Gols", value: String(goals) },
      { label: "Media de gols", value: base.total ? (goals / base.total).toFixed(1) : "0" },
    ];
  }

  if (slug === "mortal-kombat") {
    return [
      { label: "Lutas", value: String(base.total) },
      { label: "Vitorias", value: String(base.wins) },
      { label: "Derrotas", value: String(base.losses) },
      { label: "Taxa de vitoria", value: base.winRate },
    ];
  }

  if (slug === "cs-go") {
    return [
      { label: "Partidas", value: String(base.total) },
      { label: "Kills", value: String(kills) },
      { label: "Media de kills", value: base.total ? (kills / base.total).toFixed(1) : "0" },
      { label: "Deaths", value: String(deaths) },
      { label: "K/D", value: kdRatio },
      { label: "Facadas", value: String(knifeKills) },
      { label: "Headshots", value: String(headshots) },
      { label: "Vitorias", value: String(base.wins) },
    ];
  }

  return [
    { label: "Partidas", value: String(base.total) },
    { label: "Score", value: String(score) },
    { label: "Kills", value: String(kills) },
    { label: "Deaths", value: String(deaths) },
    { label: "Assists", value: String(assists) },
    { label: "K/D", value: kdRatio },
    { label: "Vitorias", value: String(base.wins) },
    { label: "Derrotas", value: String(base.losses) },
  ];
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/[0.04] p-4">
      <p className="text-xs font-medium uppercase text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function HistoryList({ matches }: { matches: MatchPlayerWithRelations[] }) {
  if (matches.length === 0) {
    return <EmptyState title="Sem historico" description="Registre partidas para preencher esta lista." />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-white/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Jogo</th>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Resultado</th>
            <th className="px-4 py-3 font-medium">Gols</th>
            <th className="px-4 py-3 font-medium">K/D/A</th>
            <th className="px-4 py-3 font-medium">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {matches.map((match) => (
            <tr key={match.id} className="text-neutral-300">
              <td className="px-4 py-3">{match.match.date.toLocaleDateString("pt-BR")}</td>
              <td className="px-4 py-3">{match.match.game.name}</td>
              <td className="px-4 py-3">{match.selectedItem?.name ?? match.teamName ?? "-"}</td>
              <td className="px-4 py-3">{match.result ?? "-"}</td>
              <td className="px-4 py-3">{numberValue(match.goals)}</td>
              <td className="px-4 py-3">
                {numberValue(match.kills)}/{numberValue(match.deaths)}/{numberValue(match.assists)}
              </td>
              <td className="px-4 py-3">{numberValue(match.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MostUsedList({ items }: { items: ReturnType<typeof getMostUsedItems> }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Nenhum item usado"
        description="Times, personagens, mapas e classes aparecerao aqui quando partidas forem registradas."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={`${item.type}-${item.name}`} className="rounded-md bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">{item.name}</p>
          <p className="mt-1 text-xs uppercase text-neutral-500">{item.type}</p>
          <p className="mt-3 text-sm text-neutral-300">{item.count} usos</p>
        </div>
      ))}
    </div>
  );
}

export default async function PlayerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const activeTab = getValidTab(query.tab);
  const player = await getPlayerById(id);

  if (!player) {
    notFound();
  }

  const matches = await getPlayerMatches(id);
  const activeMatches =
    activeTab === "geral"
      ? matches
      : matches.filter((match) => match.match.game.slug === activeTab);
  const generalStats = getBaseStats(matches);
  const mostUsedItems = getMostUsedItems(activeMatches);

  return (
    <div>
      <PageHeader
        title="Perfil do jogador"
        description="Resumo individual com estatisticas gerais, por jogo, historico e itens mais usados."
        action={
          <Link
            href="/players"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-medium text-neutral-200 transition hover:bg-white/8"
          >
            <ArrowLeft size={17} />
            Voltar
          </Link>
        }
      />

      <section className="mb-6 rounded-lg border border-white/10 bg-neutral-900 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <PlayerPhoto name={player.name} photoUrl={player.photoUrl} size="xl" />
          <div>
            <h1 className="text-3xl font-semibold text-white">{player.name}</h1>
            <p className="mt-2 text-sm text-neutral-400">
              {player.nickname ? `@${player.nickname}` : "Sem apelido cadastrado"}
            </p>
          </div>
        </div>
      </section>

      <nav className="mb-5 flex flex-wrap gap-2">
        {(Object.keys(tabLabels) as TabSlug[]).map((tab) => (
          <Link
            key={tab}
            href={`/players/${id}?tab=${tab}`}
            className={[
              "h-9 rounded-md px-3 py-2 text-sm font-medium transition",
              activeTab === tab
                ? "bg-white text-neutral-950"
                : "bg-white/8 text-neutral-300 hover:bg-white/12 hover:text-white",
            ].join(" ")}
          >
            {tabLabels[tab]}
          </Link>
        ))}
      </nav>

      {activeTab === "geral" ? (
        <div className="grid gap-4">
          <SectionCard title="Estatisticas gerais" description="Resumo consolidado de todas as partidas do jogador.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatBlock label="Total de partidas" value={String(generalStats.total)} />
              <StatBlock label="Vitorias" value={String(generalStats.wins)} />
              <StatBlock label="Derrotas" value={String(generalStats.losses)} />
              <StatBlock label="Empates" value={String(generalStats.draws)} />
              <StatBlock label="Taxa de vitoria" value={generalStats.winRate} />
            </div>
          </SectionCard>

          <SectionCard title="Estatisticas por jogo" description="Cada grupo mostra apenas os numeros daquele jogo.">
            <div className="grid gap-4 lg:grid-cols-2">
              {gameTabs.map((tab) => {
                const gameMatches = matches.filter((match) => match.match.game.slug === tab);
                const stats = getGameSpecificStats(tab, gameMatches);

                return (
                  <div key={tab} className="rounded-md bg-white/[0.03] p-4">
                    <h2 className="text-base font-semibold text-white">{tabLabels[tab]}</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {stats.slice(0, 4).map((stat) => (
                        <StatBlock key={stat.label} label={stat.label} value={stat.value} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      ) : (
        <SectionCard
          title={tabLabels[activeTab]}
          description="Esta aba mostra somente estatisticas e historico do jogo selecionado."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {getGameSpecificStats(activeTab, activeMatches).map((stat) => (
              <StatBlock key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </SectionCard>
      )}

      <div className="mt-6 grid gap-6">
        <SectionCard
          title="Historico de partidas"
          description={
            activeTab === "geral"
              ? "Todas as partidas registradas para este jogador."
              : `Somente partidas de ${tabLabels[activeTab]}.`
          }
        >
          <div className="overflow-x-auto">
            <HistoryList matches={activeMatches} />
          </div>
        </SectionCard>

        <SectionCard
          title="Itens mais usados"
          description="Times, personagens, mapas ou classes mais usados nas partidas registradas."
        >
          <MostUsedList items={mostUsedItems} />
        </SectionCard>
      </div>
    </div>
  );
}

