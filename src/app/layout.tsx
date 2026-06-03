import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sorteador Times",
  description: "Sorteio de times, jogos e estatisticas de jogadores.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-neutral-950">
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
