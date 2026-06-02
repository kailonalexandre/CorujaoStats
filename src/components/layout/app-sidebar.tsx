"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  Dices,
  Home,
  Medal,
  Settings,
  Shield,
  Users,
} from "lucide-react";

const navigation = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/players", label: "Jogadores", icon: Users },
  { href: "/raffles", label: "Sorteios", icon: Dices },
  { href: "/matches", label: "Partidas", icon: ClipboardList },
  { href: "/stats", label: "Estatisticas", icon: BarChart3 },
  { href: "/ranking", label: "Ranking", icon: Medal },
  { href: "/settings", label: "Configuracoes", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-white/10 bg-neutral-950/95 backdrop-blur md:sticky md:top-0 md:min-h-dvh md:w-72 md:border-r">
      <div className="flex h-full flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-400 text-neutral-950 shadow-sm shadow-emerald-500/30">
            <Shield size={22} strokeWidth={2.4} />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold text-white">Sortearor Times</span>
            <span className="block text-xs text-neutral-400">Sorteios e estatisticas</span>
          </span>
        </Link>

        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 md:mx-0 md:grid md:overflow-visible md:pb-0">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium transition focus-visible:outline md:shrink",
                  isActive
                    ? "bg-white text-neutral-950 shadow-sm shadow-black/20"
                    : "text-neutral-300 hover:bg-white/8 hover:text-white",
                ].join(" ")}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
