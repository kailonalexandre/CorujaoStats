"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { createPlayerAction } from "@/app/players/actions";
import { initialPlayerFormState } from "@/app/players/_components/player-form-state";
import { PlayerFormFields } from "@/app/players/_components/player-form-fields";

export function CreatePlayerForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    createPlayerAction,
    initialPlayerFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="relative grid w-full gap-5 rounded-2xl border border-white/10 bg-neutral-900/80 p-5 shadow-[0_24px_100px_-70px_rgba(255,255,255,0.18)]"
    >
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Novo jogador</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Adicione nome, idade, foto e capa para montar o perfil completo.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <PlayerFormFields state={state} />

        {state.message ? (
          <p
            className={[
              "mt-2 rounded-md px-3 py-2 text-sm",
              state.status === "success"
                ? "bg-emerald-500/10 text-emerald-200"
                : "bg-red-500/10 text-red-200",
            ].join(" ")}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
          Cadastrar
        </button>
      </div>
    </form>
  );
}
