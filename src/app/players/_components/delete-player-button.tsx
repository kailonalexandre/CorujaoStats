"use client";

import { Trash2 } from "lucide-react";
import { deletePlayerAction } from "@/app/players/actions";

type DeletePlayerButtonProps = {
  playerId: string;
  playerName: string;
};

export function DeletePlayerButton({ playerId, playerName }: DeletePlayerButtonProps) {
  return (
    <form
      action={deletePlayerAction}
      onSubmit={(event) => {
        if (!confirm(`Excluir ${playerName}?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={playerId} />
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-red-400/30 px-3 text-sm font-medium text-red-200 transition hover:bg-red-500/10"
      >
        <Trash2 size={16} />
        Excluir
      </button>
    </form>
  );
}
