"use client";

import type { Game, GameItemType } from "@prisma/client";
import { useActionState, useEffect, useRef } from "react";
import { Boxes, Loader2, Plus } from "lucide-react";
import { createGameItemAction } from "@/app/settings/items/actions";
import { GameItemFormFields } from "@/app/settings/items/_components/game-item-form-fields";
import { initialGameItemFormState } from "@/app/settings/items/_components/game-item-form-state";

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
    <form
      ref={formRef}
      action={formAction}
      className="overflow-hidden rounded-lg border border-white/10 bg-neutral-900 shadow-[0_24px_80px_-70px_rgba(255,255,255,0.2)]"
    >
      <div className="border-b border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-md border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
            <Boxes size={21} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Adicionar item ao sorteio</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-400">
              Use esta area para cadastrar qualquer coisa que possa sair em um sorteio: time,
              personagem, mapa, classe ou arma.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-white/10 bg-neutral-950/70 p-3 text-xs leading-5 text-neutral-400">
          Depois de cadastrar, o item fica ativo automaticamente e ja aparece nas telas de sorteio.
        </div>
      </div>

      <div className="p-5">
        {games.length === 0 ? (
          <p className="rounded-md border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Cadastre um jogo antes de adicionar itens.
          </p>
        ) : (
          <GameItemFormFields
            games={games}
            types={types}
            state={state}
            defaultValues={{ gameId: selectedGameId }}
          />
        )}

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
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
          Adicionar item
        </button>
      </div>
    </form>
  );
}
