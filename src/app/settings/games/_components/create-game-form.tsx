"use client";

import { useActionState, useEffect, useRef } from "react";
import { Gamepad } from "lucide-react";
import { createGameAction } from "@/app/settings/games/actions";
import { initialGameFormState } from "@/app/settings/games/_components/game-form-state";

export function CreateGameForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    createGameAction,
    initialGameFormState,
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
      className="rounded-lg border border-white/10 bg-neutral-900 p-5 shadow-sm shadow-black/20"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
          <Gamepad size={20} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">Cadastrar jogo</h2>
          <p className="text-sm text-neutral-400">Adicione um jogo para liberar itens e sorteios.</p>
        </div>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-neutral-200">Nome do jogo</span>
          <input
            name="name"
            className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
            placeholder="Ex: PES"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-neutral-200">Slug do jogo</span>
          <input
            name="slug"
            className="h-11 rounded-md border border-white/10 bg-neutral-950 px-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
            placeholder="ex-pes"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-neutral-200">Descricao</span>
          <textarea
            name="description"
            rows={3}
            className="resize-none rounded-md border border-white/10 bg-neutral-950 px-3 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400"
            placeholder="Opcional: breve descricao do jogo"
          />
        </label>

        {state.message ? (
          <p
            className={[
              "rounded-md px-3 py-2 text-sm",
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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Salvando..." : "Cadastrar jogo"}
        </button>
      </div>
    </form>
  );
}
