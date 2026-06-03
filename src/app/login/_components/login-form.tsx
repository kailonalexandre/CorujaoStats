"use client";

import { useState, type FormEvent } from "react";
import { LogIn, Shield } from "lucide-react";

export function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Nao foi possivel entrar.");
      setIsPending(false);
      return;
    }

    window.location.assign("/");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium text-neutral-200">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white outline-none transition focus:border-emerald-400"
          placeholder="admin@seu-dominio.com"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium text-neutral-200">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white outline-none transition focus:border-emerald-400"
          placeholder="Sua senha"
        />
      </div>

      {error ? (
        <div className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? <Shield size={17} className="animate-pulse" /> : <LogIn size={17} />}
        Entrar
      </button>
    </form>
  );
}
