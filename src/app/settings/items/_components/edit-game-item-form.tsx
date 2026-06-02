"use client";

import type { Game, GameItem, GameItemType } from "@prisma/client";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  initialGameItemFormState,
  updateGameItemAction,
} from "@/app/settings/items/actions";
import { GameItemFormFields } from "@/app/settings/items/_components/game-item-form-fields";

type EditGameItemFormProps = {
  item: GameItem;
  games: Game[];
  types: GameItemType[];
};

export function EditGameItemForm({ item, games, types }: EditGameItemFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateGameItemAction,
    initialGameItemFormState,
  );

  return (
    <form action={formAction} className="mt-4 border-t border-white/10 pt-4">
      <input type="hidden" name="id" value={item.id} />
      <GameItemFormFields
        games={games}
        types={types}
        state={state}
        defaultValues={item}
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
        disabled={isPending}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
        Salvar
      </button>
    </form>
  );
}
