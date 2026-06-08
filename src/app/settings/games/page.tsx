import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CreateGameForm } from "@/app/settings/games/_components/create-game-form";
import { getGames } from "@/lib/db/games";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SettingsGamesPage() {
  await requirePermission("manage_games");
  const games = await getGames();

  return (
    <div>
      <PageHeader
        title="Jogos"
        description="Cadastre jogos para liberar itens sorteaveis e sorteios no sistema."
        action={
          <Link
            href="/settings/items"
            className="inline-flex h-10 items-center rounded-md border border-white/10 px-4 text-sm font-medium text-neutral-200 transition hover:bg-white/8"
          >
            Gerenciar itens
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="grid content-start gap-4">
          <CreateGameForm />
        </div>

        <section>
          {games.length === 0 ? (
            <EmptyState
              title="Nenhum jogo cadastrado"
              description="Cadastre um jogo para liberar o cadastro de itens e sorteios."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
              {games.map((game) => (
                <article
                  key={game.id}
                  className="rounded-lg border border-white/10 bg-neutral-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{game.name}</h2>
                      <p className="mt-2 text-sm text-neutral-400">{game.description ?? "Sem descricao"}</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-300">
                      {game.slug}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
