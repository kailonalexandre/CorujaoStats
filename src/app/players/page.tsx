import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CreatePlayerForm } from "@/app/players/_components/create-player-form";
import { PlayerCard } from "@/app/players/_components/player-card";
import { getPlayersByDefaultGroup } from "@/lib/db/players";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await getPlayersByDefaultGroup();

  return (
    <div>
      <PageHeader
        title="Jogadores"
        description="Cadastre jogadores do Grupo Principal com nome, apelido e foto por URL."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <CreatePlayerForm />

        <section>
          {players.length === 0 ? (
            <EmptyState
              title="Nenhum jogador cadastrado"
              description="Cadastre o primeiro jogador para usar fotos em sorteios, rankings, dashboard e perfis."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={{
                    id: player.id,
                    name: player.name,
                    nickname: player.nickname,
                    photoUrl: player.photoUrl,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
