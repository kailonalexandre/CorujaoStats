import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, Flag, Swords, Trophy, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PlayerPhoto } from "@/components/ui/player-photo";
import { PesScoreForm } from "@/app/matches/_components/pes-score-form";
import type { PesUiGameState, PesUiGroup, PesUiMatch } from "@/modules/pes";

type PesTournamentBoardProps = {
  game: PesUiGameState | null;
};

const stageLabels: Record<PesUiMatch["stage"], string> = {
  group: "Confrontos da fase de grupos",
  final: "Mata-mata principal",
  repechage: "Repescagem",
};

const groupAccents = [
  {
    border: "border-cyan-400/30",
    header: "bg-cyan-500/10 text-cyan-200",
    badge: "bg-cyan-400 text-neutral-950",
    dot: "bg-cyan-300",
  },
  {
    border: "border-pink-500/30",
    header: "bg-pink-500/10 text-pink-200",
    badge: "bg-pink-500 text-white",
    dot: "bg-pink-300",
  },
  {
    border: "border-emerald-400/30",
    header: "bg-emerald-500/10 text-emerald-200",
    badge: "bg-emerald-400 text-neutral-950",
    dot: "bg-emerald-300",
  },
  {
    border: "border-amber-400/30",
    header: "bg-amber-500/10 text-amber-100",
    badge: "bg-amber-400 text-neutral-950",
    dot: "bg-amber-300",
  },
];

function getGroupAccent(index: number) {
  return groupAccents[index % groupAccents.length];
}

function StatPill({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950/70 px-3 py-3">
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function GroupDrawCard({ group, index }: { group: PesUiGroup; index: number }) {
  const accent = getGroupAccent(index);

  return (
    <article className={`overflow-hidden rounded-lg border ${accent.border} bg-neutral-950/70 shadow-sm shadow-black/25`}>
      <header className={`flex items-center gap-3 border-b border-white/10 px-4 py-3 ${accent.header}`}>
        <span className={`grid size-9 place-items-center rounded-md text-sm font-black ${accent.badge}`}>
          {group.letter}
        </span>
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Grupo {group.letter}</h3>
      </header>

      <div className="grid gap-2 p-4">
        {group.players.map((player) => (
          <div
            key={player.id}
            className="flex min-h-14 items-center gap-3 border-b border-white/5 py-2 last:border-b-0"
          >
            <span className="w-5 text-right text-xs text-neutral-600">{player.position}</span>
            <span className={`size-1.5 rounded-full ${accent.dot}`} />
            <PlayerPhoto name={player.name} photoUrl={player.photoUrl} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{player.name}</p>
              <p className="truncate text-xs text-neutral-400">{player.teamName ?? "Sem time"}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function StandingsCard({ group, index }: { group: PesUiGroup; index: number }) {
  const accent = getGroupAccent(index);

  return (
    <article className={`overflow-hidden rounded-lg border ${accent.border} bg-neutral-950/70 shadow-sm shadow-black/25`}>
      <header className={`border-b border-white/10 px-4 py-3 ${accent.header}`}>
        <h3 className="text-sm font-black">Grupo {group.letter}</h3>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[430px] text-sm">
          <thead className="text-xs text-neutral-500">
            <tr className="border-b border-white/10">
              <th className="px-3 py-2 text-left">Jogador</th>
              <th className="px-3 py-2 text-right">Pts</th>
              <th className="px-3 py-2 text-right">SG</th>
              <th className="px-3 py-2 text-right">GP</th>
              <th className="px-3 py-2 text-right">GC</th>
            </tr>
          </thead>
          <tbody>
            {group.players.map((player) => (
              <tr key={player.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.03]">
                <td className="px-3 py-2">
                  <span className="mr-2 text-xs text-neutral-500">{player.position}</span>
                  <span className="font-medium text-white">{player.name}</span>
                  <span className="ml-2 text-xs text-neutral-500">{player.teamName}</span>
                </td>
                <td className="px-3 py-2 text-right font-bold text-white">{player.points}</td>
                <td className="px-3 py-2 text-right text-neutral-300">{player.goalDifference}</td>
                <td className="px-3 py-2 text-right text-neutral-400">{player.goalsFor}</td>
                <td className="px-3 py-2 text-right text-neutral-400">{player.goalsAgainst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function MatchCard({ sessionId, match }: { sessionId: string; match: PesUiMatch }) {
  const status = match.isFinished ? "Fechado" : match.draw ? "Penaltis" : "Aberto";

  return (
    <article className="rounded-lg border border-white/10 bg-neutral-950/70 p-4 shadow-sm shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-neutral-200">
            {match.stage === "group" ? `Grupo ${match.group}` : stageLabels[match.stage]} - Jogo{" "}
            {match.matchIndex}
          </h3>
          <p className="mt-1 text-xs text-neutral-500">Rodada {match.round}</p>
        </div>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-bold uppercase",
            match.isFinished
              ? "bg-emerald-500/10 text-emerald-200"
              : match.draw
                ? "bg-amber-500/10 text-amber-200"
                : "bg-white/10 text-neutral-200",
          ].join(" ")}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <PlayerLine
          name={match.player1}
          photoUrl={match.player1PhotoUrl}
          team={match.player1Team}
          score={match.goals1}
        />
        <PlayerLine
          name={match.player2}
          photoUrl={match.player2PhotoUrl}
          team={match.player2Team}
          score={match.goals2}
        />
      </div>

      {match.isFinished ? (
        <p className="mt-4 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-neutral-300">
          Placar: {match.goals1 ?? 0} - {match.goals2 ?? 0}
          {match.pen1 !== null && match.pen2 !== null ? ` | Penaltis: ${match.pen1} - ${match.pen2}` : ""}
        </p>
      ) : (
        <PesScoreForm sessionId={sessionId} match={match} />
      )}
    </article>
  );
}

function PlayerLine({
  name,
  photoUrl,
  team,
  score,
}: {
  name: string;
  photoUrl?: string | null;
  team?: string | null;
  score?: number | null;
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
      <PlayerPhoto name={name} photoUrl={photoUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-neutral-500">{team ?? "Sem time"}</p>
      </div>
      <span className="grid size-9 shrink-0 place-items-center rounded-md border border-white/10 bg-neutral-950 text-sm font-black text-white">
        {score ?? "-"}
      </span>
    </div>
  );
}

function MatchSection({
  title,
  sessionId,
  matches,
}: {
  title: string;
  sessionId: string;
  matches: PesUiMatch[];
}) {
  if (matches.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-black uppercase tracking-widest text-white">{title}</h3>
        <span className="w-fit rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-400">
          {matches.length} jogos
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.id} sessionId={sessionId} match={match} />
        ))}
      </div>
    </section>
  );
}

export function PesTournamentBoard({ game }: PesTournamentBoardProps) {
  if (!game || game.groupData.length === 0) {
    return (
      <EmptyState
        title="Nenhum sorteio PES ativo"
        description="Faca um sorteio de PES para gerar automaticamente grupos, classificacao e confrontos."
        action={
          <Link
            href="/raffles"
            className="inline-flex h-10 items-center rounded-md bg-emerald-500 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
          >
            Ir para sorteios
          </Link>
        }
      />
    );
  }

  const groupMatches = game.matchData.filter((match) => match.stage === "group");
  const finalMatches = game.matchData.filter((match) => match.stage === "final");
  const repechageMatches = game.matchData.filter((match) => match.stage === "repechage");
  const totalPlayers = game.groupData.reduce((total, group) => total + group.players.length, 0);
  const openMatches = game.matchData.filter((match) => !match.isFinished).length;
  const finishedMatches = game.matchData.length - openMatches;

  return (
    <section className="grid gap-8">
      <div className="rounded-lg border border-white/10 bg-neutral-900/90 p-5 shadow-sm shadow-black/30">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
              Fase de grupos
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">{game.name}</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Sorteio organizado em grupos, classificacao e confrontos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[560px]">
            <StatPill icon={<Users size={15} />} label="Jogadores" value={totalPlayers} />
            <StatPill icon={<Flag size={15} />} label="Grupos" value={game.groupData.length} />
            <StatPill icon={<Swords size={15} />} label="Jogos" value={game.matchData.length} />
            <StatPill
              icon={<CalendarDays size={15} />}
              label="Abertos"
              value={`${openMatches}/${finishedMatches}`}
            />
          </div>
        </div>

        {game.champion ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-200">
            <Trophy size={18} />
            Campeao: {game.champion.name}
          </div>
        ) : null}
      </div>

      <section>
        <h3 className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-neutral-400">
          Sorteio das chaves
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {game.groupData.map((group, index) => (
            <GroupDrawCard key={group.id} group={group} index={index} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-neutral-400">
          Classificacao
        </h3>
        <div className="grid gap-4 xl:grid-cols-2">
          {game.groupData.map((group, index) => (
            <StandingsCard key={group.id} group={group} index={index} />
          ))}
        </div>
      </section>

      <MatchSection title="Confrontos da fase de grupos" sessionId={game.id} matches={groupMatches} />
      <MatchSection title="Mata-mata principal" sessionId={game.id} matches={finalMatches} />
      <MatchSection title="Repescagem" sessionId={game.id} matches={repechageMatches} />
    </section>
  );
}
