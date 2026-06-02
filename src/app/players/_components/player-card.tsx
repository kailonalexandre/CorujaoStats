import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { PlayerPhoto } from "@/components/ui/player-photo";
import { DeletePlayerButton } from "@/app/players/_components/delete-player-button";
import { EditPlayerForm } from "@/app/players/_components/edit-player-form";

type PlayerCardProps = {
  player: {
    id: string;
    name: string;
    nickname: string | null;
    photoUrl: string | null;
  };
};

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-neutral-900 p-5">
      <div className="flex items-start gap-4">
        <PlayerPhoto name={player.name} photoUrl={player.photoUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-white">{player.name}</h2>
          <p className="mt-1 truncate text-sm text-neutral-400">
            {player.nickname ? `@${player.nickname}` : "Sem apelido"}
          </p>
          <Link
            href={`/players/${player.id}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Ver perfil
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <details className="group">
          <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-medium text-neutral-200 transition hover:bg-white/8">
            <Pencil size={16} />
            Editar
          </summary>
          <EditPlayerForm player={player} />
        </details>
        <DeletePlayerButton playerId={player.id} playerName={player.name} />
      </div>
    </article>
  );
}

