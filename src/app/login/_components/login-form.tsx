"use client";

import { useState, type FormEvent } from "react";
import { LogIn, Shield, UserPlus } from "lucide-react";

type AuthMode = "login" | "register";

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
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
      <div className="grid grid-cols-2 rounded-md border border-white/10 bg-neutral-950 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={[
            "h-10 rounded text-sm font-semibold transition",
            mode === "login"
              ? "bg-white text-neutral-950"
              : "text-neutral-300 hover:bg-white/8 hover:text-white",
          ].join(" ")}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError("");
          }}
          className={[
            "h-10 rounded text-sm font-semibold transition",
            mode === "register"
              ? "bg-white text-neutral-950"
              : "text-neutral-300 hover:bg-white/8 hover:text-white",
          ].join(" ")}
        >
          Criar conta
        </button>
      </div>

      {mode === "register" ? (
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium text-neutral-200">
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white outline-none transition focus:border-emerald-400"
            placeholder="Seu nome"
          />
        </div>
      ) : null}

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
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white outline-none transition focus:border-emerald-400"
          placeholder="Sua senha"
        />
      </div>

      {mode === "register" ? (
        <div className="grid gap-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-200">
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-sm text-white outline-none transition focus:border-emerald-400"
            placeholder="Repita a senha"
          />
        </div>
      ) : null}

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
        {isPending ? (
          <Shield size={17} className="animate-pulse" />
        ) : mode === "login" ? (
          <LogIn size={17} />
        ) : (
          <UserPlus size={17} />
        )}
        {mode === "login" ? "Entrar" : "Criar conta"}
      </button>
    </form>
  );
}
