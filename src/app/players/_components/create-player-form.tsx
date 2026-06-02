"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, UserPlus } from "lucide-react";
import {
  createPlayerAction,
  initialPlayerFormState,
} from "@/app/players/actions";
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
    <form ref={formRef} action={formAction} className="rounded-lg border border-white/10 bg-neutral-900 p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Novo jogador</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Os jogadores cadastrados aqui entram automaticamente no Grupo Principal.
        </p>
      </div>

      <PlayerFormFields state={state} />

      {state.message ? (
        <p
          className={[
            "mt-4 rounded-md px-3 py-2 text-sm",
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
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
        Cadastrar
      </button>
    </form>
  );
}
