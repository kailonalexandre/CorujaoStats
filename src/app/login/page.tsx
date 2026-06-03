import { Shield } from "lucide-react";
import { LoginForm } from "@/app/login/_components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.14),transparent_34rem)] px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900/90 p-6 shadow-sm shadow-black/30 sm:p-7">
        <div className="mb-6">
          <div className="mb-4 grid size-11 place-items-center rounded-lg bg-emerald-400 text-neutral-950">
            <Shield size={23} strokeWidth={2.4} />
          </div>
          <h1 className="text-2xl font-semibold text-white">Acesso ao Sorteador Times</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Entre com um usuario autorizado para acessar sorteios, partidas e configuracoes.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
