import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { RaffleBoard } from "@/app/raffles/_components/raffle-board";
import { prisma } from "@/lib/db/prisma";
import { getPlayersByDefaultGroup } from "@/lib/db/players";

export const dynamic = "force-dynamic";

export default async function RafflesPage() {
  const [players, games, items] = await Promise.all([
    getPlayersByDefaultGroup(),
    prisma.game.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.gameItem.findMany({
      where: {
        active: true,
        type: {
          in: ["team", "character", "map", "class", "weapon", "other"],
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Sorteios"
        description="Selecione jogadores, sorteie itens ativos do banco e salve o historico do resultado."
        action={
          <Link
            href="/raffles/history"
            className="inline-flex h-10 items-center rounded-md border border-white/10 px-4 text-sm font-medium text-neutral-200 transition hover:bg-white/8"
          >
            Historico
          </Link>
        }
      />

      <RaffleBoard players={players} games={games} items={items} />
    </div>
  );
}
