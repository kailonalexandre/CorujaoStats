"use client";

import type { Game, GameItemType } from "@prisma/client";
import { useActionState, useEffect, useRef } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  createGameItemAction,
  initialGameItemFormState,
} from "@/app/settings/items/actions";
import { GameItemFormFields } from "@/app/settings/items/_components/game-item-form-fields";

type CreateGameItemFormProps = {
  games: Game[];
  types: GameItemType[];
  selectedGameId?: string;
};

export function CreateGameItemForm({ games, types, selectedGameId }: CreateGameItemFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    createGameItemAction,
    initialGameItemFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="rounded-lg border border-white/10 bg-neutral-900 p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Novo item</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Cadastre times, personagens, mapas, classes, armas ou outros itens.
        </p>
      </div>

      <GameItemFormFields
        games={games}
        types={types}
        state={state}
        defaultValues={{ gameId: selectedGameId }}
      />

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
        disabled={isPending || games.length === 0}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
        Cadastrar
      </button>
    </form>
  );
}
