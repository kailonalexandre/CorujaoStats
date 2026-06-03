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
        description="Cadastre jogadores do Grupo Principal com idade, foto enviada do computador e capa de perfil."
      />

      <div className="grid gap-6 items-start xl:grid-cols-[460px_minmax(0,1fr)]">
        <div className="w-full">
          <CreatePlayerForm />
        </div>

        <section className="grid gap-6 w-full">
          {players.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-neutral-950/70 p-6 min-h-[450px]">
              <EmptyState
                title="Nenhum jogador cadastrado"
                description="Cadastre o primeiro jogador para usar fotos em sorteios, rankings, dashboard e perfis."
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={{
                    id: player.id,
                    name: player.name,
                    nickname: player.nickname,
                    age: player.age,
                    photoUrl: player.photoUrl,
                    coverUrl: player.coverUrl,
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
