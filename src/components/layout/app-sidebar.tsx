"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  BarChart3,
  ClipboardList,
  Dices,
  Home,
  Medal,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  LogOut,
  Users,
} from "lucide-react";
import type { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

export function AppSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigation = [
    { href: "/", label: "Dashboard", icon: Home, show: true },
    { href: "/players", label: "Jogadores", icon: Users, show: true },
    { href: "/raffles", label: "Sorteios", icon: Dices, show: hasPermission(user, "manage_raffles") },
    { href: "/matches", label: "Partidas", icon: ClipboardList, show: hasPermission(user, "manage_matches") },
    { href: "/stats", label: "Estatisticas", icon: BarChart3, show: hasPermission(user, "view_stats") },
    { href: "/ranking", label: "Ranking", icon: Medal, show: hasPermission(user, "view_stats") },
    {
      href: "/settings",
      label: "Configuracoes",
      icon: Settings,
      show:
        hasPermission(user, "manage_games") ||
        hasPermission(user, "manage_items") ||
        hasPermission(user, "manage_users"),
    },
  ];

  function toggleSidebar() {
    setIsCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  async function handleLogout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <aside
      className={[
        "border-white/10 bg-neutral-950/95 backdrop-blur transition-[width] duration-200 md:sticky md:top-0 md:min-h-dvh md:border-r",
        isCollapsed ? "md:w-20" : "md:w-72",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-full flex-col gap-4 p-4 md:gap-6",
          isCollapsed ? "md:px-3 md:py-6" : "md:p-6",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center gap-2",
            isCollapsed ? "md:grid md:justify-items-center" : "",
          ].join(" ")}
        >
          <Link
            href="/"
            className={[
              "flex min-w-0 flex-1 items-center rounded-lg focus-visible:outline",
              isCollapsed ? "justify-center md:flex-none" : "gap-3",
            ].join(" ")}
            title={isCollapsed ? "Sorteador Times" : undefined}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-400 text-neutral-950 shadow-sm shadow-emerald-500/30">
              <Shield size={22} strokeWidth={2.4} />
            </span>
            <span className={["min-w-0", isCollapsed ? "md:hidden" : ""].join(" ")}>
              <span className="block text-base font-semibold text-white">Sorteador Times</span>
              <span className="block text-xs text-neutral-400">Sorteios e estatisticas</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            className={[
              "hidden size-10 shrink-0 place-items-center rounded-md border border-white/10 text-neutral-300 transition hover:bg-white/8 hover:text-white md:grid",
              isCollapsed ? "md:mx-auto" : "",
            ].join(" ")}
            aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav
          className={[
            "-mx-1 flex gap-1 overflow-x-auto pb-1 md:mx-0 md:grid md:overflow-visible md:pb-0",
            isCollapsed ? "md:justify-items-center" : "",
          ].join(" ")}
        >
          {navigation.filter((item) => item.show).map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={[
                  "flex h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium transition focus-visible:outline md:shrink",
                  isCollapsed ? "md:size-11 md:justify-center md:px-0" : "",
                  isActive
                    ? "bg-white text-neutral-950 shadow-sm shadow-black/20"
                    : "text-neutral-300 hover:bg-white/8 hover:text-white",
                ].join(" ")}
              >
                <Icon size={18} className="shrink-0" />
                <span className={isCollapsed ? "md:hidden" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={["mt-auto border-t border-white/10 pt-4", isCollapsed ? "md:grid md:justify-items-center" : ""].join(" ")}>
          <div className={["mb-3 min-w-0", isCollapsed ? "md:hidden" : ""].join(" ")}>
            <p className="truncate text-sm font-medium text-white">{user?.name ?? "Usuario"}</p>
            <p className="truncate text-xs text-neutral-500">{user?.email ?? "Sessao ativa"}</p>
          </div>
          <form onSubmit={handleLogout}>
            <button
              type="submit"
              className={[
                "flex h-10 items-center gap-3 rounded-md border border-white/10 px-3 text-sm font-medium text-neutral-300 transition hover:bg-white/8 hover:text-white",
                isCollapsed ? "md:size-10 md:justify-center md:px-0" : "w-full",
              ].join(" ")}
              title="Sair"
            >
              <LogOut size={17} className="shrink-0" />
              <span className={isCollapsed ? "md:hidden" : ""}>Sair</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
