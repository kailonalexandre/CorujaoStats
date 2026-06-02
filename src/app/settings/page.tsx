import Link from "next/link";
import { Box, Gamepad2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Configuracoes"
        description="Central para administrar jogos, itens sorteaveis e futuras preferencias por grupo."
      />
      <div className="grid gap-4 md:grid-cols-2">
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

        <SectionCard title="Jogos" description="Cadastro e manutencao de categorias ficarao integrados ao banco.">
          <div className="flex items-center gap-3 text-sm text-neutral-300">
            <Gamepad2 size={20} className="text-emerald-400" />
            <span>PES, Mortal Kombat, CS:GO / CS2, Battlefield e novos jogos.</span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
