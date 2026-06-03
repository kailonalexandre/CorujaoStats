"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { updatePlayerAction } from "@/app/players/actions";
import { initialPlayerFormState } from "@/app/players/_components/player-form-state";
import { PlayerFormFields } from "@/app/players/_components/player-form-fields";

type EditPlayerFormProps = {
  player: {
    id: string;
    name: string;
    nickname: string | null;
    age: number | null;
    photoUrl: string | null;
    coverUrl: string | null;
  };
  onSuccess?: () => void;
};

export function EditPlayerForm({ player, onSuccess }: EditPlayerFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePlayerAction,
    initialPlayerFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [onSuccess, state.status]);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={player.id} />
      <PlayerFormFields state={state} defaultValues={player} />

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
