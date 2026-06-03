"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { getCurrentUser } from "@/lib/auth/session";

type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

export function AppShell({ children, user }: Readonly<{ children: React.ReactNode; user: CurrentUser }>) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <div className="min-h-dvh bg-neutral-950 text-neutral-100">{children}</div>;
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="min-h-dvh bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px] md:flex">
        <AppSidebar user={user} />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
