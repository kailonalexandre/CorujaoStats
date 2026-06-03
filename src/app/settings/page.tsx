import Link from "next/link";
import { Box, Gamepad2, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Configuracoes"
        description="Central para administrar jogos, itens sorteaveis e futuras preferencias por grupo."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/settings/items"
          className="rounded-lg border border-white/10 bg-neutral-900 p-5 transition hover:border-emerald-400/60"
        >
          <Box className="mb-4 text-emerald-400" size={24} />
          <h2 className="text-base font-semibold text-white">Itens sorteaveis</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Cadastre times, personagens, mapas, classes, armas e outros itens por jogo.
          </p>
        </Link>

        <Link
          href="/settings/games"
          className="rounded-lg border border-white/10 bg-neutral-900 p-5 transition hover:border-emerald-400/60"
        >
          <Gamepad2 className="mb-4 text-emerald-400" size={24} />
          <h2 className="text-base font-semibold text-white">Jogos</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Cadastre jogos para liberar itens e sorteios. PES, CS:GO, Mortal Kombat e mais.
          </p>
        </Link>

        <Link
          href="/settings/users"
          className="rounded-lg border border-white/10 bg-neutral-900 p-5 transition hover:border-emerald-400/60"
        >
          <Users className="mb-4 text-emerald-400" size={24} />
          <h2 className="text-base font-semibold text-white">Usuarios e permissoes</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Cadastre usuarios, libere acessos e bloqueie contas quando necessario.
          </p>
        </Link>
      </div>
    </div>
  );
}
