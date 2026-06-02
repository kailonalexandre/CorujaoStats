import Link from "next/link";
import { BarChart3, ClipboardList, Dices, Medal, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PlayerPhoto } from "@/components/ui/player-photo";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_GROUP_ID, ensureDefaultGroup, getPlayersByDefaultGroup } from "@/lib/db/players";
import { getSumRanking, getWinRanking, type PlayerMetricRow } from "@/lib/db/stats";

const shortcuts = [
  { href: "/raffles", label: "Novo sorteio", icon: Dices },
  { href: "/matches", label: "Registrar partida", icon: ClipboardList },
  { href: "/players", label: "Cadastrar jogador", icon: UserPlus },
  { href: "/ranking", label: "Ver rankings", icon: Medal },
  { href: "/stats", label: "Ver estatisticas", icon: BarChart3 },
];

function HighlightPlayer({
  label,
  metric,
  suffix = "",
}: {
  label: string;
  metric?: PlayerMetricRow;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-white/[0.04] px-4 py-3">
      <div>
        <p className="text-sm text-neutral-400">{label}</p>
        {metric ? (
          <div className="mt-2 flex items-center gap-3">
            <PlayerPhoto name={metric.player.name} photoUrl={metric.player.photoUrl} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{metric.player.name}</p>
              <p className="truncate text-xs text-neutral-500">{metric.player.nickname || "Sem apelido"}</p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">Sem dados</p>
        )}
      </div>
      <span className="shrink-0 text-lg font-semibold text-emerald-200">
        {metric ? `${metric.value}${suffix}` : "-"}
      </span>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await ensureDefaultGroup();

  const [
    playerCount,
    matchCount,
    raffleCount,
    players,
    mostPlayedGames,
    winRanking,
    killRanking,
    goalRanking,
  ] = await Promise.all([
    prisma.player.count({ where: { groupId: DEFAULT_GROUP_ID } }),
    prisma.match.count({ where: { groupId: DEFAULT_GROUP_ID } }),
    prisma.raffleHistory.count({ where: { groupId: DEFAULT_GROUP_ID } }),
    getPlayersByDefaultGroup(),
    prisma.match.groupBy({
      by: ["gameId"],
      where: {
        groupId: DEFAULT_GROUP_ID,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          gameId: "desc",
        },
      },
      take: 1,
    }),
    getWinRanking(["pes", "mortal-kombat", "cs-go", "cs-go-cs2", "battlefield"], 1),
    getSumRanking(["cs-go", "cs-go-cs2", "battlefield"], "kills", 1),
    getSumRanking(["pes"], "goals", 1),
  ]);
  const mostPlayedGame = mostPlayedGames[0]
    ? await prisma.game.findUnique({
        where: {
          id: mostPlayedGames[0].gameId,
        },
      })
    : null;

  const stats = [
    { label: "Jogadores", value: String(playerCount) },
    { label: "Partidas", value: String(matchCount) },
    { label: "Sorteios", value: String(raffleCount) },
    { label: "Jogo mais jogado", value: mostPlayedGame?.name ?? "-" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visao inicial do Sortearor Times. Os indicadores serao alimentados pelo banco conforme jogadores, partidas e sorteios forem cadastrados."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Destaques" description="Resumo competitivo preparado para estatisticas agregadas.">
          <div className="grid gap-3 text-sm">
            <HighlightPlayer label="Jogador com mais vitorias" metric={winRanking[0]} />
            <HighlightPlayer label="Jogador com mais kills" metric={killRanking[0]} />
            <HighlightPlayer label="Jogador com mais gols" metric={goalRanking[0]} />
          </div>
        </SectionCard>

        <SectionCard title="Atalhos" description="Caminhos principais para os proximos modulos.">
          <div className="grid gap-3 sm:grid-cols-2">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;

              return (
                <Link
                  key={shortcut.href}
                  href={shortcut.href}
                  className="flex h-14 items-center gap-3 rounded-md bg-white text-sm font-semibold text-neutral-950 transition hover:bg-emerald-200"
                >
                  <span className="ml-4 grid size-8 place-items-center rounded-md bg-neutral-950 text-white">
                    <Icon size={17} />
                  </span>
                  <span>{shortcut.label}</span>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Jogadores do grupo" description="Fotos e iniciais usadas nos proximos sorteios, rankings e perfis.">
          {players.length === 0 ? (
            <p className="text-sm text-neutral-400">Nenhum jogador cadastrado.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {players.slice(0, 8).map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex items-center gap-3 rounded-md bg-white/[0.04] px-3 py-2 transition hover:bg-white/8"
                >
                  <PlayerPhoto name={player.name} photoUrl={player.photoUrl} size="sm" />
                  <span className="text-sm font-medium text-white">{player.name}</span>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

